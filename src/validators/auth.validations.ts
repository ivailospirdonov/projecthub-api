import { z } from "zod";

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters long" }),
  name: z
    .string()
    .min(1, { error: "Name cannot be empty" })
    .max(50, { error: "Name must be at most 50 characters" })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters long" }),
});
