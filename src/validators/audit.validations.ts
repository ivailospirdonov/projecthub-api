import { AuditAction, AuditEntityType } from "@prisma/client";
import { z } from "zod";

export type ListAuditInput = z.infer<typeof listAuditSchema>;

export const listAuditSchema = z.object({
  entityType: z.nativeEnum(AuditEntityType).optional(),
  action: z.nativeEnum(AuditAction).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),

  cursor: z.coerce.number().int().positive().optional(),
  take: z.coerce.number().int().positive().max(100).default(50),
});
