import { Request, Response } from "express";
import * as auditService from "../services/audit.services";
import { AuditAction, AuditEntityType } from "@prisma/client";

export async function listAuditLogsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { organizationId, entityType, action, from, to } = req.query;

    if (!organizationId) {
      return res.status(400).json({
        message: "organizationId is required",
      });
    }

    const logs = await auditService.listAuditLogs(
      userId,
      Number(organizationId),
      {
        entityType: entityType as AuditEntityType,
        action: action as AuditAction,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
      },
    );

    res.json(logs);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
