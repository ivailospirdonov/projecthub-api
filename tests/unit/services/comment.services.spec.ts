import { AppError } from "../../../src/errors/app-error";
import * as commentService from "../../../src/services/comment.services";
import { prisma } from "../../../src/utils/prisma";

describe("Comment Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("should throw if task does not exist", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        commentService.createComment(1, { taskId: 1, content: "Hello" }),
      ).rejects.toThrow(AppError);
    });

    it("should throw if user is not a member of the organization", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 1 },
      });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        commentService.createComment(1, { taskId: 1, content: "Hello" }),
      ).rejects.toThrow(AppError);
    });

    it("should create a comment and log audit", async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        project: { organizationId: 1 },
      });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "MEMBER",
      });
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: 1,
        content: "Hello",
        authorId: 1,
        taskId: 1,
      });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await commentService.createComment(1, {
        taskId: 1,
        content: "Hello",
      });

      expect(prisma.comment.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        content: "Hello",
        authorId: 1,
        taskId: 1,
      });
    });
  });

  describe("deleteComment", () => {
    it("should throw if comment not found", async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(commentService.deleteComment(1, 1)).rejects.toThrow(
        AppError,
      );
    });

    it("should throw if user is not a member", async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        authorId: 2,
        task: { project: { organizationId: 1 } },
      });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(commentService.deleteComment(1, 1)).rejects.toThrow(
        AppError,
      );
    });

    it("should throw if user is not author or admin/owner", async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        authorId: 2,
        task: { project: { organizationId: 1 } },
      });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "MEMBER",
      });

      await expect(commentService.deleteComment(1, 1)).rejects.toThrow(
        AppError,
      );
    });

    it("should delete comment and log audit for author or admin", async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        authorId: 1,
        task: { project: { organizationId: 1 } },
      });
      (prisma.userOrganization.findUnique as jest.Mock).mockResolvedValue({
        role: "MEMBER",
      });
      (prisma.comment.delete as jest.Mock).mockResolvedValue({});
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      const result = await commentService.deleteComment(1, 1);

      expect(prisma.comment.delete).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result).toEqual({ message: "Comment deleted" });
    });
  });
});
