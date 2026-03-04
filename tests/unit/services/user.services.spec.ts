import { AppError } from "../../../src/errors/app-error";
import * as userService from "../../../src/services/user.services";
import { prisma } from "../../../src/utils/prisma";

describe("User Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should throw if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile(1)).rejects.toThrow(AppError);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
    });

    it("should return user profile", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getProfile(1);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    it("should update user", async () => {
      const input = {
        name: "Updated Name",
      };

      const updatedUser = {
        id: 1,
        name: "Updated Name",
        email: "john@example.com",
        createdAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(1, input);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      expect(result).toEqual(updatedUser);
    });
  });
});
