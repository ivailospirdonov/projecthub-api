import { AppError } from "../../../src/errors/app-error";
import * as projectService from "../../../src/services/project.services";
import { prisma } from "../../../src/utils/prisma";

describe("Project Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("should throw if no membership", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({
          userOrganization: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      await expect(
        projectService.createProject(1, "Test", undefined, 10),
      ).rejects.toThrow(AppError);
    });

    it("should create project with tasks", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb({
          userOrganization: {
            findUnique: jest.fn().mockResolvedValue({}),
          },
          project: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
          },
          task: {
            createMany: jest.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await projectService.createProject(
        1,
        "Test Project",
        "Desc",
        10,
        [{ title: "Task 1" }],
      );

      expect(result).toEqual({ id: 1 });
    });
  });

  describe("getProject", () => {
    it("should throw if project not found", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(projectService.getProject(1, 1)).rejects.toThrow(AppError);
    });

    it("should throw if no membership", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(projectService.getProject(1, 1)).rejects.toThrow(AppError);
    });

    it("should return project", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      const result = await projectService.getProject(1, 1);

      expect(result.id).toBe(1);
    });
  });

  describe("updateProject", () => {
    it("should throw if not admin/owner", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "MEMBER",
      });

      await expect(
        projectService.updateProject(1, 1, { name: "New" }),
      ).rejects.toThrow(AppError);
    });

    it("should update project", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "OWNER",
      });

      (prisma.project.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Updated",
      });

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await projectService.updateProject(1, 1, {
        name: "Updated",
      });

      expect(prisma.project.update).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.name).toBe("Updated");
    });
  });

  describe("deleteProject", () => {
    it("should delete project if owner", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "OWNER",
      });

      (prisma.project.delete as jest.Mock).mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await projectService.deleteProject(1, 1);

      expect(prisma.project.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: "Project deleted" });
    });
  });

  describe("listProjects", () => {
    it("should throw if no membership", async () => {
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(projectService.listProjects(1, 10)).rejects.toThrow(
        AppError,
      );
    });

    it("should return paginated projects", async () => {
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.project.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      const result = await projectService.listProjects(1, 10, undefined, 2);

      expect(result.data.length).toBe(2);
      expect(result.nextCursor).toBe(3);
    });
  });
});
