import { Request, Response } from "express";
import * as commentService from "../services/comment.services";
import {
  CreateCommentInput,
  createCommentSchema,
  DeleteCommentInput,
  deleteCommentSchema,
} from "../validators/comment.validations";

export async function createCommentHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const input: CreateCommentInput = createCommentSchema.parse(req.body);

    const comment = await commentService.createComment(userId, input);

    return res.status(201).json(comment);
  } catch (err: any) {
    //remove any;
    return res.status(400).json({ message: err.message });
  }
}

export async function deleteCommentHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId; //remove any;
    const { id: commentId }: DeleteCommentInput = deleteCommentSchema.parse(
      req.query,
    );

    const result = await commentService.deleteComment(userId, commentId);

    return res.json(result);
  } catch (err: any) {
    //remove any;
    return res.status(400).json({ message: err.message });
  }
}
