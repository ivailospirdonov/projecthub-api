import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { AppError } from "../errors/app-error";
import { ErrorCodes } from "../errors/error-codes";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
      throw new AppError("No token provided", 401, ErrorCodes.UNAUTHORIZED);
    }

    const tokenParts = authHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      throw new AppError("Invalid token format", 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = tokenParts[1];
    const decoded = jwt.verify(token, jwtConfig.accessSecret);

    // Add userId to the request
    (req as any).user = decoded; // remove any

    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }

    return next(
      new AppError("Invalid or expired token", 401, ErrorCodes.INVALID_TOKEN),
    );
  }
}
