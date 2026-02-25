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

  return prisma.tag.create({
    data: {
      name,
      organizationId,
    },
  });
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

  return prisma.taskTag.create({
    data: {
      taskId,
      tagId,
    },
  });
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

  return prisma.taskTag.delete({
    where: {
      taskId_tagId: {
        taskId,
        tagId,
      },
    },
  });
}
