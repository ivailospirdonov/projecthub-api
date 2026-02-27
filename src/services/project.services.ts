import { AuditAction, AuditEntityType } from "@prisma/client";
import { prisma } from "../prisma";
import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";

export async function createProject(
  userId: number,
  name: string,
  description: string | undefined,
  organizationId: number,
) {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Access denied", 409, ErrorCodes.FORBIDDEN);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      organizationId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.CREATED,
      entityType: AuditEntityType.PROJECT,
      entityId: project.id,
      metadata: { name, description },
    },
  });

  return project;
}

export async function getProject(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404, ErrorCodes.PROJECT_NOT_FOUND);
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
    throw new AppError("Access denied", 409, ErrorCodes.FORBIDDEN);
  }

  return project;
}

export async function updateProject(
  projectId: number,
  userId: number,
  data: { name?: string; description?: string },
) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404, ErrorCodes.PROJECT_NOT_FOUND);
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
    throw new AppError("Access denied", 409, ErrorCodes.FORBIDDEN);
  }

  if (membership.role !== "ADMIN" && membership.role !== "OWNER") {
    throw new AppError("Insufficient permissions", 409, ErrorCodes.FORBIDDEN);
  }

  const updateProject = await prisma.project.update({
    where: { id: projectId },
    data,
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.UPDATED,
      entityType: AuditEntityType.PROJECT,
      entityId: project.id,
      metadata: data,
    },
  });

  return updateProject;
}

export async function deleteProject(projectId: number, userId: number) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError("Project not found", 404, ErrorCodes.PROJECT_NOT_FOUND);
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
    throw new AppError("Access denied", 409, ErrorCodes.FORBIDDEN);
  }

  if (membership.role !== "ADMIN" && membership.role !== "OWNER") {
    throw new AppError("Insufficient permissions", 409, ErrorCodes.FORBIDDEN);
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.DELETED,
      entityType: AuditEntityType.PROJECT,
      entityId: project.id,
      metadata: {},
    },
  });

  return { message: "Project deleted" };
}

export async function listProjects(
  userId: number,
  organizationId: number,
  cursor?: number,
  take: number = 10,
) {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: organizationId,
      },
    },
  });

  if (!membership) {
    throw new AppError("Access denied", 409, ErrorCodes.FORBIDDEN);
  }

  const projects = await prisma.project.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      id: "asc",
    },
    take: take + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });

  let nextCursor: number | null = null;

  if (projects.length > take) {
    const nextItem = projects.pop();
    nextCursor = nextItem!.id;
  }

  return {
    data: projects,
    nextCursor,
  };
}
