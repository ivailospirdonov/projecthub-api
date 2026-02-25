import { Router } from "express";
import {
  createCommentHandler,
  deleteCommentHandler,
} from "../controllers/comment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createCommentHandler);
router.delete("/:id", authenticate, deleteCommentHandler);

export default router;
