import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getProjectHandler,
  createProjectHandler,
  deleteProjectHandler,
  updateProjectHandler,
  listProjectsHandler,
} from "../controllers/project.controller";

const router = Router();

router.post("/", authenticate, createProjectHandler);
router.get("/:id", authenticate, getProjectHandler);
router.put("/:id", authenticate, updateProjectHandler);
router.delete("/:id", authenticate, deleteProjectHandler);
router.get("/organization/:organizationId", authenticate, listProjectsHandler);

export default router;
