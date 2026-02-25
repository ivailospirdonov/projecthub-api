import { Request, Response } from "express";
import * as projectService from "../services/project.services";

export async function createProjectHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { name, description, organizationId } = req.body;

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
    const projectId = Number(req.params.id);

    const project = await projectService.getProject(projectId, userId);
    return res.json(project);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function updateProjectHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const projectId = Number(req.params.id);
    const { name, description } = req.body;

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
    const userId = (req as any).user.userId;
    const projectId = Number(req.params.id);

    const result = await projectService.deleteProject(projectId, userId);
    return res.json(result);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function listProjectsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const organizationId = Number(req.params.organizationId);

    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const take = req.query.take ? Number(req.query.take) : 10;

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
