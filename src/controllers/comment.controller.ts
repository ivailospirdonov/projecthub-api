import { NextFunction, Request, Response } from "express";
import * as commentService from "../services/comment.services";
import {
  CreateCommentInput,
  createCommentSchema,
  DeleteCommentInput,
  deleteCommentSchema,
} from "../validators/comment.validations";

export async function createCommentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const input: CreateCommentInput = createCommentSchema.parse(req.body);

    const comment = await commentService.createComment(userId, input);

    req.log.info({ commentId: comment.id }, "Comment created successfully");
    return res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

export async function deleteCommentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: commentId }: DeleteCommentInput = deleteCommentSchema.parse(
      req.query,
    );

    const result = await commentService.deleteComment(userId, commentId);

    req.log.info({ commentId }, "Comment deleted successfully");
    return res.json(result);
  } catch (error) {
    next(error);
  }
}
