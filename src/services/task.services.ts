import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "../prisma";

const allowedTransactions: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS"],
  IN_PROGRESS: ["DONE"],
  DONE: ["IN_PROGRESS"],
};

export async function createTask(
  userId: number,
  projectId: number,
  title: string,
  description?: string,
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: project.organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error("Access denied");
  }

  return prisma.task.create({
    data: {
      title,
      description,
      projectId,
    },
  });
}

export async function getTask(taskId: number, userId: number) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
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

  return task;
}

export async function updateTask(
  userId: number,
  taskId: number,
  data: {
    title?: string;
    description?: string;
    assigneeId?: number | null;
  },
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: { project: true },
  });

  if (!task) {
    throw new Error("Task not found");
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

  return prisma.task.update({
    where: { id: taskId },
    data,
  });
}

export async function deleteTask(taskId: number, userId: number) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
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

  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Insufficient permissions");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { message: "Task deleted" };
}

export async function changeTaskStatus(
  userId: number,
  taskId: number,
  newStatus: TaskStatus,
) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
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

  const currentStatus = task.status;
  const allowed = allowedTransactions[currentStatus];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
    );
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });
}

export async function listTasks(
  userId: number,
  query: {
    projectId: number;
    status?: TaskStatus;
    assigneeId?: number;
    sort?: "createdAt";
    order?: "asc" | "desc";
  },
) {
  const { projectId, status, assigneeId, sort, order } = query;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: project.organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error("Access denied");
  }

  const where: Prisma.TaskWhereInput = {
    projectId,
  };

  if (status) {
    where.status = status;
  }

  if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [sort || "createdAt"]: order || "desc",
  };

  return prisma.task.findMany({
    where,
    orderBy,
  });
}
