import { Request, Response } from "express";
import * as tagService from "../services/tag.services";

export async function createTagHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { organizationId, name } = req.body;

    const tag = await tagService.createTag(
      userId,
      Number(organizationId),
      name,
    );

    res.status(201).json(tag);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function listTagsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { organizationId } = req.query;

    if (!organizationId) {
      return res.status(400).json({
        message: "organizationId is required",
      });
    }

    const tags = await tagService.listTags(userId, Number(organizationId));

    res.json(tags);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function attachTagHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { taskId, tagId } = req.body;

    const result = await tagService.attachTagToTask(
      userId,
      Number(taskId),
      Number(tagId),
    );

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function detachTagHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { taskId, tagId } = req.body;

    const result = await tagService.detachTagFromTask(
      userId,
      Number(taskId),
      Number(tagId),
    );

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
