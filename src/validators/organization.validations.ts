import { OrganizationRole } from "@prisma/client";
import { z } from "zod";

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteParams = z.infer<typeof inviteParamsSchema>;
export type InviteBody = z.infer<typeof inviteBodySchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export const createOrganizationSchema = z.object({
  name: z
    .string({ error: "Organization name is required" })
    .min(2, { error: "Organization name must be at least 2 characters" })
    .max(50, { error: "Organization name cannot exceed 50 characters" }),
});

export const inviteParamsSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can contain only lowercase letters, numbers and hyphens",
    ),
});

export const inviteBodySchema = z.object({
  email: z.string().email({ error: "Invalid email address" }),
  role: z.nativeEnum(OrganizationRole),
});

export const acceptInviteSchema = z.object({
  token: z
    .string({ error: "Token is required" })
    .regex(/^[a-f0-9]{64}$/, "Invalid invitation token"),
});
