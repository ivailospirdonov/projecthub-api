import { Router } from "express";
import {
  changeTaskStatusHandler,
  createTaskHandler,
  deleteTaskHandler,
  getTaskHandler,
  listTasksHandler,
  updateTaskHandler,
} from "../controllers/task.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createTaskHandler);
router.get("/", authenticate, listTasksHandler);
router.get("/:id", authenticate, getTaskHandler);
router.patch("/:id", authenticate, updateTaskHandler);
router.patch("/:id/status", authenticate, changeTaskStatusHandler);
router.delete("/:id", authenticate, deleteTaskHandler);

export default router;
