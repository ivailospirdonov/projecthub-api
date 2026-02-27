import { NextFunction, Request, Response } from "express";
import * as auditService from "../services/audit.services";
import {
  ListAuditInput,
  listAuditSchema,
} from "../validators/audit.validations";

export async function listAuditLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filters: ListAuditInput = listAuditSchema.parse(req.query);

    const logs = await auditService.listAuditLogs(filters);

    res.json(logs);
  } catch (error) {
    next(error);
  }
}
