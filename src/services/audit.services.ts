import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";
import { prisma } from "../utils/prisma";
import { ListAuditInput } from "../validators/audit.validations";

export async function listAuditLogs(userId: number, filters: ListAuditInput) {
  const memberships = await prisma.userOrganization.findMany({
    where: { userId },
    select: { organizationId: true },
  });

  const organizationIds = memberships.map((m) => m.organizationId);

  if (organizationIds.length === 0) {
    throw new AppError("Access denied", 403, ErrorCodes.FORBIDDEN);
  }

  return prisma.auditLog.findMany({
    where: {
      organizationId: {
        in: organizationIds,
      },
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
