import { z } from "zod";

export type CreateProjectWithTasksInput = z.infer<
  typeof createProjectWithTasksSchema
>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type ListProjectsParams = z.infer<typeof listProjectsParamsSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

export const createProjectWithTasksSchema = z.object({
  name: z
    .string({ error: "Project name is required" })
    .min(1, { error: "Project name cannot be empty" })
    .max(100, { error: "Project name too long" }),

  description: z.string().max(1000, "Description too long").optional(),
  organizationId: z.number({ error: "organizationId is required" }),
  tasks: z
    .array(
      z.object({
        title: z
          .string({ error: "Title is required" })
          .min(1, { error: "Title cannot be empty" })
          .max(200, { error: "Title too long" }),

        description: z
          .string()
          .max(2000, { error: "Description too long" })
          .optional(),
      }),
    )
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Project name cannot be empty" })
    .max(100, { error: "Project name too long" })
    .optional(),

  description: z.string().max(1000).optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Project id must be a number");
    return parsed;
  }),
});

export const listProjectsParamsSchema = z.object({
  organizationId: z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("organizationId must be a number");
    return parsed;
  }),
});

export const listProjectsQuerySchema = z.object({
  cursor: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  take: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
});
