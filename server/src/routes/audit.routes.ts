import { Router } from "express";
import { listAuditLogsHandler } from "../controllers/audit.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, listAuditLogsHandler);

export default router;
