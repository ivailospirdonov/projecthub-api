import { AuditAction, AuditEntityType } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";

export async function createTag(
  userId: number,
  organizationId: number,
  name: string,
) {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
    select: {},
  });

  if (!membership) {
    throw new AppError("Access denied", 403, ErrorCodes.FORBIDDEN);
  }

  const tag = await prisma.tag.create({
    data: {
      name,
      organizationId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      organizationId,
      action: AuditAction.CREATED,
      entityType: AuditEntityType.TAG,
      entityId: tag.id,
      metadata: { name },
    },
  });

  return tag;
}

export async function listTags(userId: number, organizationId: number) {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
    select: {},
  });

  if (!membership) {
    throw new AppError("Access denied", 403, ErrorCodes.FORBIDDEN);
  }

  return prisma.tag.findMany({
    where: {
      organizationId,
    },
  });
}

export async function attachTagToTask(
  userId: number,
  taskId: number,
  tagId: number,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404, ErrorCodes.TASK_NOT_FOUND);
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    select: {
      organizationId: true,
    },
  });

  if (!tag) {
    throw new AppError("Tag not found", 404, ErrorCodes.TAG_NOT_FOUND);
  }

  if (tag.organizationId !== task.project.organizationId) {
    throw new AppError(
      "Tag does not belong to the same organization",
      403,
      ErrorCodes.FORBIDDEN,
    );
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: task.project.organizationId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Access denied", 403, ErrorCodes.FORBIDDEN);
  }

  let taskTag = await prisma.taskTag.create({
    data: {
      taskId,
      tagId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      organizationId: task.project.organizationId,
      action: AuditAction.ATTACHED,
      entityType: AuditEntityType.TAG,
      entityId: tagId,
      metadata: { taskId },
    },
  });

  return taskTag;
}

export async function detachTagFromTask(
  userId: number,
  taskId: number,
  tagId: number,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      project: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404, ErrorCodes.TASK_NOT_FOUND);
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    select: {},
  });

  if (!tag) {
    throw new AppError("Tag not found", 404, ErrorCodes.TAG_NOT_FOUND);
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: task.project.organizationId,
      },
    },
    select: {},
  });

  if (!membership) {
    throw new AppError("Access denied", 403, ErrorCodes.FORBIDDEN);
  }

  await prisma.taskTag.delete({
    where: {
      taskId_tagId: {
        taskId,
        tagId,
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      organizationId: task.project.organizationId,
      action: AuditAction.DETACHED,
      entityType: AuditEntityType.TAG,
      entityId: tagId,
      metadata: { taskId },
    },
  });

  return { message: "Tag detached" };
}
