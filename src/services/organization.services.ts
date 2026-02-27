import { AuditAction, AuditEntityType, OrganizationRole } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../prisma";

export async function createOrganization(userId: number, name: string) {
  let organization = await prisma.organization.create({
    data: {
      name,
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
  organizationId: number,
  email: string,
  role: OrganizationRole,
) {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: Number(organizationId),
      },
    },
  });

  if (
    !membership ||
    (membership.role !== "ADMIN" && membership.role !== "OWNER")
  ) {
    throw new Error("Not allowed");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const invitation = await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId: Number(organizationId),
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
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    throw new Error("Invalid invitation");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation already used");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation expired");
  }

  const existingMembership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: invitation.organizationId,
      },
    },
  });

  if (existingMembership) {
    throw new Error("User is already a member");
  }

  await prisma.userOrganization.create({
    data: {
      userId,
      organizationId: invitation.organizationId,
      role: invitation.role,
    },
  });

  const updatedInvitation = await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.MEMBER_JOINED,
      entityType: AuditEntityType.ORGANIZATION,
      entityId: invitation.id,
      metadata: {},
    },
  });

  return updatedInvitation;
}
