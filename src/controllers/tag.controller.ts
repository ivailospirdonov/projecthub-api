import { NextFunction, Request, Response } from "express";
import * as tagService from "../services/tag.services";
import {
  CreateTagInput,
  createTagSchema,
  ListTagsQuery,
  listTagsQuerySchema,
  TagTaskInput,
  tagTaskSchema,
} from "../validators/tag.validations";

export async function createTagHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { organizationId, name }: CreateTagInput = createTagSchema.parse(
      req.body,
    );

    const tag = await tagService.createTag(userId, organizationId, name);

    req.log.info({ tagId: tag.id }, "Tag created successfully");
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
}

export async function listTagsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
  } catch (error) {
    next(error);
  }
}

export async function attachTagHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { taskId, tagId }: TagTaskInput = tagTaskSchema.parse(req.body);

    const result = await tagService.attachTagToTask(userId, taskId, tagId);

    req.log.info({ tagId, taskId }, "Tag attached successfully");
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function detachTagHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { taskId, tagId }: TagTaskInput = tagTaskSchema.parse(req.body);

    const result = await tagService.detachTagFromTask(userId, taskId, tagId);

    req.log.info({ tagId, taskId }, "Tag detached successfully");
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
