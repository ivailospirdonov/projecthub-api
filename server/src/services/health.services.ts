import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";
import { prisma } from "../utils/prisma";

export async function checkHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    throw new AppError(
      "Health check failed",
      500,
      ErrorCodes.HEALTH_CHECK_ERROR,
    );
  }
}
