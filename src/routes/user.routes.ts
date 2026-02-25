import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getProfileHandler,
  updateProfileHandler,
} from "../controllers/user.controller";

const router = Router();

router.get("/me", authenticate, getProfileHandler);
router.patch("/me", authenticate, updateProfileHandler);

export default router;
