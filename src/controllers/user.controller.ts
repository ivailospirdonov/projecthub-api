import { Request, Response } from "express";
import { getProfile, updateProfile } from "../services/user.services";
import {
  UpdateProfileData,
  updateProfileSchema,
} from "../validators/user.validation";

export async function getProfileHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user!.userId; // remove any
    const user = await getProfile(userId);

    return res.json(user);
  } catch (err: any) {
    //remove any;
    res.status(400).json({ message: err.message });
  }
}

export async function updateProfileHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user!.userId; // remove any
    const input: UpdateProfileData = updateProfileSchema.parse(req.body);
    const updatedUser = await updateProfile(userId, input);

    return res.json(updatedUser);
  } catch (err: any) {
    //remove any;
    res.status(400).json({ message: err.message });
  }
}
