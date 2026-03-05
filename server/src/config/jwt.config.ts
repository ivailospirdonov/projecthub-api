import { Secret, SignOptions } from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;

/**
 * JWT configuration is validated once at application startup.
 *
 * We fail fast if any required environment variable is missing,
 * instead of validating on every token generation.
 */
if (
  !JWT_ACCESS_SECRET ||
  !JWT_REFRESH_SECRET ||
  !ACCESS_TOKEN_EXPIRES_IN ||
  !REFRESH_TOKEN_EXPIRES_IN
) {
  throw new Error("Missing JWT environment variables");
}

export const jwtConfig = {
  accessSecret: JWT_ACCESS_SECRET as Secret,
  refreshSecret: JWT_REFRESH_SECRET as Secret,
  accessExpiresIn: ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  refreshExpiresIn: REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
};
