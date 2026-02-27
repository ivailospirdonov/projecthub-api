import { z } from "zod";

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;
export type TagTaskInput = z.infer<typeof tagTaskSchema>;

export const createTagSchema = z.object({
  organizationId: z.number({
    error: "organizationId is required",
  }),

  name: z
    .string({ error: "Tag name is required" })
    .min(1, { error: "Tag name cannot be empty" })
    .max(50, { error: "Tag name too long" }),
});

export const listTagsQuerySchema = z.object({
  organizationId: z
    .string({ error: "organizationId is required" })
    .transform((val) => {
      const parsed = Number(val);
      if (isNaN(parsed)) throw new Error("organizationId must be a number");
      return parsed;
    }),
});

export const tagTaskSchema = z.object({
  taskId: z.number({ error: "taskId is required" }),
  tagId: z.number({ error: "tagId is required" }),
});
