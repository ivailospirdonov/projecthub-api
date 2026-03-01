import { AppError } from "../../../src/errors/app-error";
import * as authService from "../../../src/services/auth.services";
import { prisma } from "../../../src/utils/prisma";
import bcrypt from "bcrypt";

describe("Auth Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should throw if user already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
      });

      await expect(
        authService.signup({
          email: "test@example.com",
          password: "123456",
        }),
      ).rejects.toThrow(AppError);
    });

    it("should create user and return tokens", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
      });

      const result = await authService.signup({
        email: "test@example.com",
        password: "123456",
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(prisma.refreshToken.create).toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: "mocked-token",
        refreshToken: "mocked-token",
      });
    });
  });

  describe("login", () => {
    it("should throw if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "123456",
        }),
      ).rejects.toThrow(AppError);
    });

    it("should throw if password is invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        password: "hashed",
      });

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow(AppError);
    });

    it("should return tokens on success", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        password: "hashed",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: "test@example.com",
        password: "123456",
      });

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalled();
      expect(prisma.refreshToken.create).toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: "mocked-token",
        refreshToken: "mocked-token",
      });
    });
  });
});
