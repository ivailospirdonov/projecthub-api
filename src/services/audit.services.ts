import { prisma } from "../prisma";
import { ListAuditInput } from "../validators/audit.validations";

export async function listAuditLogs(filters: ListAuditInput) {
  return prisma.auditLog.findMany({
    where: {
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
