import { AuditAction, AuditEntityType } from "@prisma/client";
import { prisma } from "../prisma";

export async function createTag(
  userId: number,
  organizationId: number,
  name: string,
) {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
  });

  if (!membership) {
    throw new Error("Access denied");
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
  });

  if (!membership) {
    throw new Error("Access denied");
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
    include: { project: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new Error("Tag not found");
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
    throw new Error("Access denied");
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
      action: AuditAction.ATTACHED,
      entityType: AuditEntityType.TAG,
      entityId: tag.id,
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
    include: { project: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new Error("Tag not found");
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
    throw new Error("Access denied");
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
      action: AuditAction.DETACHED,
      entityType: AuditEntityType.TAG,
      entityId: tag.id,
      metadata: { taskId },
    },
  });

  return { message: "Tag detached" };
}
