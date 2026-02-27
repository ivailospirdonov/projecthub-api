import { Router } from "express";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
} from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:id", authenticate, getProjectHandler);
router.get("/organization/:organizationId", authenticate, listProjectsHandler);
router.post("/", authenticate, createProjectHandler);
router.put("/:id", authenticate, updateProjectHandler);
router.delete("/:id", authenticate, deleteProjectHandler);

export default router;
