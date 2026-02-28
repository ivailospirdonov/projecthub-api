import { NextFunction, Request, Response } from "express";
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

export async function createOrganizationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { name }: CreateOrganizationInput = createOrganizationSchema.parse(
      req.body,
    );

    const organization = await organizationService.createOrganization(
      userId,
      name,
    );

    req.log.info(
      { organizationId: organization.id },
      "Organization created successfully",
    );
    res.status(201).json(organization);
  } catch (error) {
    next(error);
  }
}

export async function listOrganizationsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;

    const organization =
      await organizationService.listUserOrganizations(userId);

    res.json(organization);
  } catch (error) {
    next(error);
  }
}

export async function inviteMemberHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { slug }: InviteParams = inviteParamsSchema.parse(req.params);
    const { email, role }: InviteBody = inviteBodySchema.parse(req.body);

    const invitation = await organizationService.inviteMember(
      userId,
      slug,
      email,
      role,
    );

    req.log.info(
      { invitationId: invitation.id },
      "Invitation created successfully",
    );
    res.json(invitation);
  } catch (error) {
    next(error);
  }
}

export async function acceptInviteHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; // remove any
    const { token }: AcceptInviteInput = acceptInviteSchema.parse(req.body);

    const invitation = await organizationService.acceptInvite(userId, token);

    req.log.info(
      { invitationId: invitation.id },
      "Invitation accepted successfully",
    );
    res.json(invitation);
  } catch (error) {
    next(error);
  }
}
