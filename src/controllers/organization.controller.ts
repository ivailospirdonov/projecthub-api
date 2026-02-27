import { Request, Response } from "express";
import * as organizationService from "../services/organization.services";
import {
  AcceptInviteInput,
  acceptInviteSchema,
  CreateOrganizationInput,
  createOrganizationSchema,
  InviteBody,
  inviteBodySchema,
  InviteParams,
  inviteParamsSchema,
} from "../validators/organization.validations";

export async function createOrganizationHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { name }: CreateOrganizationInput = createOrganizationSchema.parse(
      req.body,
    );

    const organization = await organizationService.createOrganization(
      userId,
      name,
    );

    res.status(201).json(organization);
  } catch (err) {
    res.status(400).json({ message: "Failed to create organization" });
  }
}

export async function listOrganizationsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;

    const organization =
      await organizationService.listUserOrganizations(userId);

    res.json(organization);
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch organizations" });
  }
}

export async function inviteMemberHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { organizationId }: InviteParams = inviteParamsSchema.parse(
      req.params,
    );
    const { email, role }: InviteBody = inviteBodySchema.parse(req.body);

    const invitation = await organizationService.inviteMember(
      userId,
      organizationId,
      email,
      role,
    );

    res.json(invitation);
  } catch (err: any) {
    //remove any;
    return res.status(400).json({ message: err.message });
  }
}

export async function acceptInviteHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; // remove any
    const { token }: AcceptInviteInput = acceptInviteSchema.parse(req.body);

    const invitation = await organizationService.acceptInvite(userId, token);

    res.json(invitation);
  } catch (err: any) {
    //remove any;
    return res.status(400).json({ message: err.message });
  }
}
