import { Request, Response } from "express";
import * as commentService from "../services/comment.services";

export async function createCommentHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { taskId, content } = req.body;

    const comment = await commentService.createComment(userId, taskId, content);

    return res.status(200).json(comment);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

export async function deleteCommentHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const commentId = Number(req.query.id);

    const result = await commentService.deleteComment(userId, commentId);

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}
