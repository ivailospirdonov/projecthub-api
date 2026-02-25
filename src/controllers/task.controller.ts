import { Request, Response } from "express";
import * as taskService from "../services/task.services";
import { TaskStatus } from "@prisma/client";

export async function createTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { title, description, projectId } = req.body;

    const task = await taskService.createTask(
      userId,
      projectId,
      title,
      description,
    );

    return res.status(201).json(task);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function getTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const taskId = Number(req.params.id);

    const task = await taskService.getTask(taskId, userId);

    return res.json(task);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function updateTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const taskId = Number(req.params.id);
    const { title, description, assigneeId } = req.body;

    const updatedTask = await taskService.updateTask(userId, taskId, {
      title,
      description,
      assigneeId,
    });

    return res.json(updatedTask);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function deleteTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const taskId = Number(req.params.id);

    const result = await taskService.deleteTask(taskId, userId);

    return res.json(result);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function changeTaskStatusHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const taskId = Number(req.params.id);
    const { status } = req.body;

    const updatedTask = await taskService.changeTaskStatus(
      userId,
      taskId,
      status as TaskStatus,
    );

    return res.json(updatedTask);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function listTasksHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const { projectId, status, assigneeId, sort, order } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const tasks = await taskService.listTasks(userId, {
      projectId: Number(projectId),
      status: status as TaskStatus,
      assigneeId: assigneeId ? Number(assigneeId) : undefined,
      sort: sort as "createdAt",
      order: order as "asc" | "desc",
    });

    return res.json(tasks);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}
