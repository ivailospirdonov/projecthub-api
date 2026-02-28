import { AuditAction, AuditEntityType } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { prisma } from "../utils/prisma";
import { LoginInput, SignupInput } from "../validators/auth.validations";
import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";

const SALT_ROUNDS = 10;

export function generateAccessToken(payload: any) {
  // remove any
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });
}

export function generateRefreshToken(payload: any) {
  // remove any
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export async function signup({ email, password }: SignupInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {},
  });

  if (!existingUser) {
    throw new AppError(
      "User already exists",
      409,
      ErrorCodes.USER_ALREADY_EXISTS,
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.CREATED,
      entityType: AuditEntityType.USER,
      entityId: user.id,
      metadata: { email },
    },
  });

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}

export async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new AppError(
      "Invalid credentials",
      401,
      ErrorCodes.INVALID_CREDENTIALS,
    );
  }

  const isPasswordValid = await comparePasswords(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(
      "Invalid credentials",
      401,
      ErrorCodes.INVALID_CREDENTIALS,
    );
  }

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}
