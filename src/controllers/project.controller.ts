import { NextFunction, Request, Response } from "express";
import * as projectService from "../services/project.services";
import {
  CreateProjectWithTasksInput,
  createProjectWithTasksSchema,
  ListProjectsParams,
  listProjectsParamsSchema,
  ListProjectsQuery,
  listProjectsQuerySchema,
  ProjectIdParam,
  projectIdParamSchema,
  UpdateProjectInput,
  updateProjectSchema,
} from "../validators/project.validations";

export async function createProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const {
      name,
      description,
      organizationId,
      tasks,
    }: CreateProjectWithTasksInput = createProjectWithTasksSchema.parse(
      req.body,
    );

    const project = await projectService.createProject(
      userId,
      name,
      description,
      organizationId,
      tasks,
    );

    req.log.info({ projectId: project.id }, "Project created successfully");
    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function getProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId;
    const { id: projectId }: ProjectIdParam = projectIdParamSchema.parse(
      req.params,
    );

    const project = await projectService.getProject(projectId, userId);
    return res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: projectId }: ProjectIdParam = projectIdParamSchema.parse(
      req.params,
    );
    const { name, description }: UpdateProjectInput = updateProjectSchema.parse(
      req.body,
    );

    const project = await projectService.updateProject(projectId, userId, {
      name,
      description,
    });

    req.log.info({ projectId: project.id }, "Project updated successfully");
    return res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: projectId }: ProjectIdParam = projectIdParamSchema.parse(
      req.params,
    );

    const result = await projectService.deleteProject(projectId, userId);

    req.log.info({ projectId }, "Project deleted successfully");
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function listProjectsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { organizationId }: ListProjectsParams =
      listProjectsParamsSchema.parse(req.params);
    const { cursor, take }: ListProjectsQuery = listProjectsQuerySchema.parse(
      req.query,
    );

    const result = await projectService.listProjects(
      userId,
      organizationId,
      cursor,
      take,
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
}
