import { prisma } from "../prisma";

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
    throw new Error("Not a member of this organization");
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      organizationId,
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

  if (membership.role !== "ADMIN" && membership.role !== "OWNER") {
    throw new Error("Insufficient role");
  }

  const updateProject = await prisma.project.update({
    where: { id: projectId },
    data,
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

  if (membership.role !== "ADMIN" && membership.role !== "OWNER") {
    throw new Error("Insufficient role");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
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
    throw new Error("Access denied");
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
