import { NextFunction, Request, Response } from "express";
import * as taskService from "../services/task.services";
import {
  ChangeTaskStatusInput,
  changeTaskStatusSchema,
  CreateTaskInput,
  createTaskSchema,
  ListTasksQuery,
  listTasksQuerySchema,
  TaskIdParam,
  taskIdParamSchema,
  UpdateTaskInput,
  updateTaskSchema,
} from "../validators/task.validations";

export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { title, description, projectId }: CreateTaskInput =
      createTaskSchema.parse(req.body);

    const task = await taskService.createTask(
      userId,
      projectId,
      title,
      description,
    );

    req.log.info({ taskId: task.id }, "Task created successfully");
    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function getTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: taskId }: TaskIdParam = taskIdParamSchema.parse(req.params);

    const task = await taskService.getTask(taskId, userId);

    return res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: taskId }: TaskIdParam = taskIdParamSchema.parse(req.params);
    const { title, description, assigneeId }: UpdateTaskInput =
      updateTaskSchema.parse(req.body);

    const updatedTask = await taskService.updateTask(userId, taskId, {
      title,
      description,
      assigneeId,
    });

    req.log.info({ taskId }, "Task updated successfully");
    return res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: taskId }: TaskIdParam = taskIdParamSchema.parse(req.params);

    const result = await taskService.deleteTask(taskId, userId);

    req.log.info({ taskId }, "Task deleted successfully");
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function changeTaskStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: taskId }: TaskIdParam = taskIdParamSchema.parse(req.params);
    const { status }: ChangeTaskStatusInput = changeTaskStatusSchema.parse(
      req.body,
    );

    const updatedTask = await taskService.changeTaskStatus(
      userId,
      taskId,
      status,
    );

    req.log.info({ taskId, status }, "Task status changed successfully");
    return res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

export async function listTasksHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;

    const { projectId, status, assigneeId, sort, order }: ListTasksQuery =
      listTasksQuerySchema.parse(req.query);

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const tasks = await taskService.listTasks(userId, {
      projectId,
      status,
      assigneeId,
      sort,
      order,
    });

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
}
