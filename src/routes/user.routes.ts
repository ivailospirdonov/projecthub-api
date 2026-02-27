import { Router } from "express";
import {
  getProfileHandler,
  updateProfileHandler,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getProfileHandler);
router.patch("/", authenticate, updateProfileHandler);

export default router;
