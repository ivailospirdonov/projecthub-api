import { z } from "zod";

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export const updateProfileSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).optional(),
  name: z
    .string()
    .min(1, { message: "Name cannot be empty" })
    .max(50, { message: "Name must be at most 50 characters" })
    .optional(),
});
