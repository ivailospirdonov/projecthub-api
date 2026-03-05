import { Router } from "express";
import {
  attachTagHandler,
  createTagHandler,
  detachTagHandler,
  listTagsHandler,
} from "../controllers/tag.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createTagHandler);
router.get("/", authenticate, listTagsHandler);
router.post("/attach", authenticate, attachTagHandler);
router.post("/detach", authenticate, detachTagHandler);

export default router;
