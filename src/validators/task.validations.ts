import { TaskStatus } from "@prisma/client";
import { z } from "zod";

export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const taskIdParamSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Task id must be a number");
    return parsed;
  }),
});

export const createTaskSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(200, "Title too long"),

  description: z.string().max(2000, "Description too long").optional(),

  projectId: z.number({
    error: "projectId is required",
  }),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200).optional(),

  description: z.string().max(2000).optional(),

  assigneeId: z.number().optional(),
});

export const changeTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export const listTasksQuerySchema = z.object({
  projectId: z.string({ error: "projectId is required" }).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("projectId must be a number");
    return parsed;
  }),

  status: z.nativeEnum(TaskStatus).optional(),

  assigneeId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  sort: z.enum(["createdAt"]).optional(),

  order: z.enum(["asc", "desc"]).optional(),
});
