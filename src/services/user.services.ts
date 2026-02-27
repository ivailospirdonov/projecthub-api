import { AuditAction, AuditEntityType } from "@prisma/client";
import { prisma } from "../prisma";
import { UpdateProfileData } from "../validators/user.validation";
import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, ErrorCodes.USER_NOT_FOUND);
  }

  return user;
}

export async function updateProfile(userId: number, input: UpdateProfileData) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.UPDATED,
      entityType: AuditEntityType.USER,
      entityId: userId,
      metadata: input,
    },
  });

  return user;
}
