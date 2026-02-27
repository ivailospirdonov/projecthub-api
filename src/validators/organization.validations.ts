import { OrganizationRole } from "@prisma/client";
import { z } from "zod";

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteParams = z.infer<typeof inviteParamsSchema>;
export type InviteBody = z.infer<typeof inviteBodySchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export const createOrganizationSchema = z.object({
  name: z
    .string({ error: "Organization name is required" })
    .min(1, { message: "Organization name cannot be empty" })
    .max(100, { message: "Organization name cannot exceed 100 characters" }),
});

export const inviteParamsSchema = z.object({
  organizationId: z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error("organizationId must be a number");
    return parsed;
  }),
});

export const inviteBodySchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.nativeEnum(OrganizationRole),
});

export const acceptInviteSchema = z.object({
  token: z
    .string({ error: "Token is required" })
    .regex(/^[a-f0-9]{64}$/, "Invalid invitation token"),
});
