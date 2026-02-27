import { AuditAction, AuditEntityType } from "@prisma/client";
import { prisma } from "../prisma";
import { CreateCommentInput } from "../validators/comment.validations";

export async function createComment(userId: number, input: CreateCommentInput) {
  const { taskId, content } = input;
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

  let comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      authorId: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.CREATED,
      entityType: AuditEntityType.COMMENT,
      entityId: comment.id,
      metadata: input,
    },
  });

  return comment;
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

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.DELETED,
      entityType: AuditEntityType.COMMENT,
      entityId: comment.id,
      metadata: {},
    },
  });

  return { message: "Comment deleted" };
}
