import { Router } from "express";
import {
  acceptInvite,
  createOrganizationHandler,
  inviteMember,
  listOrganizationsHandler,
} from "../controllers/organization.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createOrganizationHandler);
router.post("/:organizationId/invite", authenticate, inviteMember);
router.post("/accept-invite", authenticate, acceptInvite);
router.get("/", authenticate, listOrganizationsHandler);

export default router;
