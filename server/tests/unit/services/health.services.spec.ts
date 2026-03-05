import { checkHealth } from "../../../src/services/health.services";
import { prisma } from "../../../src/utils/prisma";
import { AppError } from "../../../src/errors/app-error";
import { ErrorCodes } from "../../../src/errors/error-codes";

describe("Health Service - Unit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return ok status when database is reachable", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(1);

    const result = await checkHealth();

    expect(result).toHaveProperty("status", "ok");
    expect(result).toHaveProperty("timestamp");
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it("should throw AppError if database query fails", async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error("DB down"));

    await expect(checkHealth()).rejects.toBeInstanceOf(AppError);
    await expect(checkHealth()).rejects.toMatchObject({
      message: "Health check failed",
      statusCode: 500,
      code: ErrorCodes.HEALTH_CHECK_ERROR,
    });
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
