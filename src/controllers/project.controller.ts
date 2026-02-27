import { Request, Response } from "express";
import * as projectService from "../services/project.services";
import {
  CreateProjectInput,
  createProjectSchema,
  ListProjectsParams,
  listProjectsParamsSchema,
  ListProjectsQuery,
  listProjectsQuerySchema,
  ProjectIdParam,
  projectIdParamSchema,
  UpdateProjectInput,
  updateProjectSchema,
} from "../validators/project.validations";

export async function createProjectHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { name, description, organizationId }: CreateProjectInput =
      createProjectSchema.parse(req.body);

    const project = await projectService.createProject(
      userId,
      name,
      description,
      organizationId,
    );
    return res.status(201).json(project);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function getProjectHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { id: projectId }: ProjectIdParam = projectIdParamSchema.parse(
      req.params,
    );

    const project = await projectService.getProject(projectId, userId);
    return res.json(project);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function updateProjectHandler(req: Request, res: Response) {
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
    return res.json(project);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function deleteProjectHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: projectId }: ProjectIdParam = projectIdParamSchema.parse(
      req.params,
    );

    const result = await projectService.deleteProject(projectId, userId);
    return res.json(result);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function listProjectsHandler(req: Request, res: Response) {
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
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}
