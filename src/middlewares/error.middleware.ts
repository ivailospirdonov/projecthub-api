import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // ZOD VALIDATION ERROR
  if (err instanceof ZodError) {
    req.log.warn({ issues: err.issues }, "Validation error");

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  // CUSTOM APP ERROR
  if (err instanceof AppError) {
    req.log.warn(
      {
        code: err.code,
        statusCode: err.statusCode,
        details: err.details,
      },
      err.message,
    );

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // UNEXPECTED ERROR
  req.log.error({ err }, "Unhandled unexpected error");

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
}
