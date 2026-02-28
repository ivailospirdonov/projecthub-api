import { Router } from "express";
import { healthCheckHandler } from "../controllers/health.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, healthCheckHandler);

export default router;
