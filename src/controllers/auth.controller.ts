import { Request, Response } from "express";
import * as authService from "../services/auth.services";
import {
  LoginInput,
  loginSchema,
  SignupInput,
  signupSchema,
} from "../validators/auth.validations";

export async function signupHandler(req: Request, res: Response) {
  const input: SignupInput = signupSchema.parse(req.body);

  try {
    const tokens = await authService.signup(input);
    res.status(201).json(tokens);
  } catch (error: any) {
    //remove any
    res.status(400).json({ message: error.message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  const input: LoginInput = loginSchema.parse(req.body);

  try {
    const tokens = await authService.login(input);
    res.json(tokens);
  } catch (error: any) {
    //remove any
    res.status(400).json({ message: error.message });
  }
}
