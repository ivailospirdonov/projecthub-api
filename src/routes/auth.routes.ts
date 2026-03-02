import { Router } from "express";
import { loginHandler, signupHandler } from "../controllers/auth.controller";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.post("/signup", authRateLimiter, signupHandler);
router.post("/login", authRateLimiter, loginHandler);

export default router;
