import { Request, Response } from "express";
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

export async function createTaskHandler(req: Request, res: Response) {
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

    return res.status(201).json(task);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function getTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: taskId }: TaskIdParam = taskIdParamSchema.parse(req.params);

    const task = await taskService.getTask(taskId, userId);

    return res.json(task);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function updateTaskHandler(req: Request, res: Response) {
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

    return res.json(updatedTask);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function deleteTaskHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: taskId }: TaskIdParam = taskIdParamSchema.parse(req.params);

    const result = await taskService.deleteTask(taskId, userId);

    return res.json(result);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function changeTaskStatusHandler(req: Request, res: Response) {
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

    return res.json(updatedTask);
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}

export async function listTasksHandler(req: Request, res: Response) {
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
  } catch (err: any) {
    //remove any
    res.status(400).json({ message: err.message });
  }
}
