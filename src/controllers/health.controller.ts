import { NextFunction, Request, Response } from "express";
import { checkHealth } from "../services/health.services";

export async function healthCheckHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await checkHealth();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
