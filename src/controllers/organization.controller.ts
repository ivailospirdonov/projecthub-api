import { Request, Response } from "express";
import * as organizationService from "../services/organization.services";
import { prisma } from "../prisma";
import crypto from "crypto";

export async function createOrganizationHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { name } = req.body;

    const organization = await organizationService.createOrganization(
      userId,
      name,
    );

    res.status(201).json(organization);
  } catch (err) {
    res.status(500).json({ message: "Failed to create organization" });
  }
}

export async function listOrganizationsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;

    const organization =
      await organizationService.listUserOrganizations(userId);

    res.json(organization);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch organizations" });
  }
}

export async function inviteMember(req: Request, res: Response) {
  const userId = (req as any).user.userId; //remove any;
  const { organizationId } = req.params;
  const { email, role } = req.body;

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
    return res.status(403).json({ message: "Not allowed" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.invitation.create({
    data: {
      email,
      role,
      organizationId: Number(organizationId),
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return res.json({
    message: "Invitation created",
    invitationToken: token,
  });
}

export async function acceptInvite(req: Request, res: Response) {
  const userId = (req as any).user.userId; // remove any
  const { token } = req.body;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return res.status(404).json({ message: "Invalid invitation" });
  }

  if (invitation.status !== "PENDING") {
    return res.status(400).json({ message: "Invitation already used" });
  }

  if (invitation.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invitation expired" });
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
    return res.status(400).json({ message: "User is already a member" });
  }

  await prisma.userOrganization.create({
    data: {
      userId,
      organizationId: invitation.organizationId,
      role: invitation.role,
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });

  return res.json({ message: "Joined organization" });
}
