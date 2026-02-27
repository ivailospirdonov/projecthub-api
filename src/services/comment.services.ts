import { AuditAction, AuditEntityType } from "@prisma/client";
import { prisma } from "../prisma";
import { CreateCommentInput } from "../validators/comment.validations";
import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";

export async function createComment(userId: number, input: CreateCommentInput) {
  const { taskId, content } = input;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
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

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: task.project.organizationId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Access denied", 409, ErrorCodes.FORBIDDEN);
  }

  const comment = await prisma.comment.create({
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
    select: {
      authorId: true,
      task: {
        select: {
          project: true,
        },
      },
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404, ErrorCodes.COMMENT_NOT_FOUND);
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: comment.task.project.organizationId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new AppError("Access denied", 409, ErrorCodes.FORBIDDEN);
  }

  if (
    comment.authorId !== userId &&
    membership.role !== "ADMIN" &&
    membership.role !== "OWNER"
  ) {
    throw new AppError("Insufficient permissions", 409, ErrorCodes.FORBIDDEN);
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.DELETED,
      entityType: AuditEntityType.COMMENT,
      entityId: commentId,
      metadata: {},
    },
  });

  return { message: "Comment deleted" };
}
