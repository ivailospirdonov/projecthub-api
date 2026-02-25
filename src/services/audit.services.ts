import { AuditAction, AuditEntityType } from "@prisma/client";
import { prisma } from "../prisma";

export async function createAuditLog(
  organizationId: number,
  userId: number,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: number,
  metadata?: any,
) {
  return prisma.auditLog.create({
    data: {
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}

export async function listAuditLogs(
  userId: number,
  organizationId: number,
  filters: {
    entityType?: AuditEntityType;
    action?: AuditAction;
    from?: Date;
    to?: Date;
  },
) {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
  });

  if (!membership) throw new Error("Access denied");

  return prisma.auditLog.findMany({
    where: {
      organizationId,
      ...(filters.entityType && { entityType: filters.entityType }),
      ...(filters.action && { action: filters.action }),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from && { gte: filters.from }),
              ...(filters.to && { lte: filters.to }),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
