import { prisma } from "../prisma";

export async function createComment(
  userId: number,
  taskId: number,
  content: string,
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

  return prisma.comment.create({
    data: {
      content,
      taskId,
      authorId: userId,
    },
  });
}

export async function deleteComment(userId: number, commentId: number) {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: comment.task.project.organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error("Access denied");
  }

  if (
    comment.authorId !== userId &&
    membership.role !== "ADMIN" &&
    membership.role !== "OWNER"
  ) {
    throw new Error("Insufficient permissions");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { message: "Comment deleted" };
}
