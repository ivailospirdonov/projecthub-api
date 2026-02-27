import { Router } from "express";
import {
  acceptInviteHandler,
  createOrganizationHandler,
  inviteMemberHandler,
  listOrganizationsHandler,
} from "../controllers/organization.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, listOrganizationsHandler);
router.post("/", authenticate, createOrganizationHandler);
router.post("/slug/invite", authenticate, inviteMemberHandler);
router.post("/accept-invite", authenticate, acceptInviteHandler);

export default router;
