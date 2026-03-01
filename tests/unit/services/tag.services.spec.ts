import { AppError } from "../../../src/errors/app-error";
import * as tagService from "../../../src/services/tag.services";
import { prisma } from "../../../src/utils/prisma";

describe("Tag Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTag", () => {
    it("should throw if no membership", async () => {
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.createTag(1, 10, "Urgent")).rejects.toThrow(
        AppError,
      );
    });

    it("should create tag and audit log", async () => {
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.tag.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Urgent",
      });

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await tagService.createTag(1, 10, "Urgent");

      expect(prisma.tag.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.name).toBe("Urgent");
    });
  });

  describe("listTags", () => {
    it("should throw if no membership", async () => {
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.listTags(1, 10)).rejects.toThrow(AppError);
    });

    it("should return tags", async () => {
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: "Bug" },
        { id: 2, name: "Feature" },
      ]);

      const result = await tagService.listTags(1, 10);

      expect(result.length).toBe(2);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: { organizationId: 10 },
      });
    });
  });

  describe("attachTagToTask", () => {
    it("should throw if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.attachTagToTask(1, 1, 1)).rejects.toThrow(
        AppError,
      );
    });

    it("should throw if tag not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 10 },
      });

      (prisma.tag.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.attachTagToTask(1, 1, 1)).rejects.toThrow(
        AppError,
      );
    });

    it("should throw if no membership", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 10 },
      });

      (prisma.tag.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.attachTagToTask(1, 1, 1)).rejects.toThrow(
        AppError,
      );
    });

    it("should attach tag and create audit log", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 10 },
      });

      (prisma.tag.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.taskTag.create as jest.Mock).mockResolvedValue({
        taskId: 1,
        tagId: 1,
      });

      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await tagService.attachTagToTask(1, 1, 1);

      expect(prisma.taskTag.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.tagId).toBe(1);
    });
  });

  describe("detachTagFromTask", () => {
    it("should throw if task not found", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(tagService.detachTagFromTask(1, 1, 1)).rejects.toThrow(
        AppError,
      );
    });

    it("should detach tag and create audit log", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 10 },
      });

      (prisma.tag.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({});

      (prisma.taskTag.delete as jest.Mock).mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await tagService.detachTagFromTask(1, 1, 1);

      expect(prisma.taskTag.delete).toHaveBeenCalledWith({
        where: {
          taskId_tagId: {
            taskId: 1,
            tagId: 1,
          },
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual({ message: "Tag detached" });
    });
  });
});
