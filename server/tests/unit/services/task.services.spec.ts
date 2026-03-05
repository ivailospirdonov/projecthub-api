import { TaskStatus } from "@prisma/client";
import { AppError } from "../../../src/errors/app-error";
import * as taskService from "../../../src/services/task.services";
import { prisma } from "../../../src/utils/prisma";

describe("Task Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("should throw if project not found", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(taskService.createTask(1, 1, "Title")).rejects.toThrow(
        AppError,
      );
    });

    it("should throw if no membership", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(taskService.createTask(1, 1, "Title")).rejects.toThrow(
        AppError,
      );
    });

    it("should create task and audit log", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Title",
      });

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.createTask(1, 1, "Title");

      expect(prisma.task.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe("deleteTask", () => {
    it("should throw if role is MEMBER", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 10 },
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "MEMBER",
      });

      await expect(taskService.deleteTask(1, 1)).rejects.toThrow(
        "Insufficient permissions",
      );
    });

    it("should delete task if OWNER", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 10 },
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "OWNER",
      });

      (prisma.task.delete as jest.Mock).mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.deleteTask(1, 1);

      expect(prisma.task.delete).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual({ message: "Task deleted" });
    });
  });

  describe("changeTaskStatus", () => {
    it("should throw on invalid transition", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        status: TaskStatus.TODO,
        project: { organizationId: 10 },
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      await expect(
        taskService.changeTaskStatus(1, 1, TaskStatus.DONE),
      ).rejects.toThrow("Invalid status transition");
    });

    it("should change status if valid transition", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        status: TaskStatus.TODO,
        project: { organizationId: 10 },
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.task.update as jest.Mock).mockResolvedValue({
        id: 1,
        status: TaskStatus.IN_PROGRESS,
      });

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.changeTaskStatus(
        1,
        1,
        TaskStatus.IN_PROGRESS,
      );

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: TaskStatus.IN_PROGRESS },
      });

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe("listTasks", () => {
    it("should apply filters and sorting", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        organizationId: 10,
      });

      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      const result = await taskService.listTasks(1, {
        projectId: 1,
        status: TaskStatus.TODO,
        assigneeId: 5,
        sort: "createdAt",
        order: "asc",
      });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 1,
          status: TaskStatus.TODO,
          assigneeId: 5,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      expect(result.length).toBe(2);
    });
  });
});
