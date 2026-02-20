import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { prisma } from "../prisma";

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

export async function signup(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
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

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await comparePasswords(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
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
