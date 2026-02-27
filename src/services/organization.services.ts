import { AuditAction, AuditEntityType, OrganizationRole } from "@prisma/client";
import crypto from "crypto";
import slugify from "slugify";
import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";
import { prisma } from "../prisma";

export async function createOrganization(userId: number, name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  const organization = await prisma.organization.create({
    data: {
      name,
      slug,
      users: {
        create: {
          userId,
          role: OrganizationRole.OWNER,
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.CREATED,
      entityType: AuditEntityType.ORGANIZATION,
      entityId: organization.id,
      metadata: { name },
    },
  });

  return organization;
}

export async function listUserOrganizations(userId: number) {
  return prisma.organization.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  });
}

export async function inviteMember(
  userId: number,
  slug: string,
  email: string,
  role: OrganizationRole,
) {
  const organization = await prisma.organization.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    throw new AppError(
      "Organization not found",
      404,
      ErrorCodes.ORGANIZATION_NOT_FOUND,
    );
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: organization.id,
      },
    },
    select: {
      role: true,
    },
  });

  if (
    !membership ||
    (membership.role !== "ADMIN" && membership.role !== "OWNER")
  ) {
    throw new AppError("Insufficient permissions", 409, ErrorCodes.FORBIDDEN);
  }

  const token = crypto.randomBytes(32).toString("hex");

  const invitation = await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId: organization.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.MEMBER_INVITED,
      entityType: AuditEntityType.ORGANIZATION,
      entityId: invitation.id,
      metadata: { email, role },
    },
  });

  return invitation;
}

export async function acceptInvite(userId: number, token: string) {
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new AppError(
        "Invitation not found",
        404,
        ErrorCodes.INVITATION_NOT_FOUND,
      );
    }

    if (invitation.status !== "PENDING") {
      throw new AppError(
        "Invitation already used",
        409,
        ErrorCodes.INVITATION_ALREADY_USED,
      );
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError(
        "Invitation expired",
        410,
        ErrorCodes.INVITATION_EXPIRED,
      );
    }

    const existingMembership = await tx.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: invitation.organizationId,
        },
      },
      select: {},
    });

    if (existingMembership) {
      throw new AppError(
        "User is already a member",
        409,
        ErrorCodes.ALREADY_MEMBER,
      );
    }

    await tx.userOrganization.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    const updatedInvitation = await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: AuditAction.MEMBER_JOINED,
        entityType: AuditEntityType.ORGANIZATION,
        entityId: invitation.id,
        metadata: { invitationId: invitation.id },
      },
    });

    return updatedInvitation;
  });
}
