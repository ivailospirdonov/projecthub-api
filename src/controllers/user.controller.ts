import { NextFunction, Request, Response } from "express";
import { getProfile, updateProfile } from "../services/user.services";

export async function getProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user!.userId; // remove any
    const user = await getProfile(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as any).user!.userId; // remove any
    const updatedUser = await updateProfile(userId, req.body);

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}
