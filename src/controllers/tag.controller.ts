import { Request, Response } from "express";
import * as tagService from "../services/tag.services";
import {
  CreateTagInput,
  createTagSchema,
  ListTagsQuery,
  listTagsQuerySchema,
  TagTaskInput,
  tagTaskSchema,
} from "../validators/tag.validations";

export async function createTagHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { organizationId, name }: CreateTagInput = createTagSchema.parse(
      req.body,
    );

    const tag = await tagService.createTag(userId, organizationId, name);

    res.status(201).json(tag);
  } catch (err: any) {
    //remove any;
    res.status(400).json({ message: err.message });
  }
}

export async function listTagsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { organizationId }: ListTagsQuery = listTagsQuerySchema.parse(
      req.query,
    );

    if (!organizationId) {
      return res.status(400).json({
        message: "organizationId is required",
      });
    }

    const tags = await tagService.listTags(userId, Number(organizationId));

    res.json(tags);
  } catch (err: any) {
    //remove any;
    res.status(400).json({ message: err.message });
  }
}

export async function attachTagHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { taskId, tagId }: TagTaskInput = tagTaskSchema.parse(req.body);

    const result = await tagService.attachTagToTask(userId, taskId, tagId);

    res.status(201).json(result);
  } catch (err: any) {
    //remove any;
    res.status(400).json({ message: err.message });
  }
}

export async function detachTagHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { taskId, tagId }: TagTaskInput = tagTaskSchema.parse(req.body);

    const result = await tagService.detachTagFromTask(userId, taskId, tagId);

    res.status(201).json(result);
  } catch (err: any) {
    //remove any;
    res.status(400).json({ message: err.message });
  }
}
