import { z } from "zod";

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export const updateProfileSchema = z.object({
  email: z.string().email({ error: "Invalid email address" }).optional(),
  name: z
    .string()
    .min(1, { error: "Name cannot be empty" })
    .max(50, { error: "Name must be at most 50 characters" })
    .optional(),
});
