import { z } from "zod";

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;

export const createCommentSchema = z.object({
  taskId: z.number({ error: "taskId is required" }),
  content: z
    .string({ error: "Content is required" })
    .min(1, { message: "Content cannot be empty" })
    .max(500, { message: "Content cannot exceed 500 characters" }),
});

export const deleteCommentSchema = z.object({
  id: z.string({ error: "Comment id is required" }).transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("Comment id must be a number");
    return parsed;
  }),
});
