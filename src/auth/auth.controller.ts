import { Request, Response } from "express";
import * as authService from "./auth.service";

export async function signupHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const tokens = await authService.signup(email, password);
    res.status(201).json(tokens);
  } catch (error: any) {
    //remove any
    res.status(400).json({ message: error.message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (error: any) {
    //remove any
    res.status(401).json({ message: error.message });
  }
}
