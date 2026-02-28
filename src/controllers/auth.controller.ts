import { NextFunction, Request, Response } from "express";
import * as authService from "../services/auth.services";
import {
  LoginInput,
  loginSchema,
  SignupInput,
  signupSchema,
} from "../validators/auth.validations";

export async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const input: SignupInput = signupSchema.parse(req.body);

  try {
    const tokens = await authService.signup(input);

    req.log.info({ email: input.email }, "User created successfully");
    res.status(201).json(tokens);
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const input: LoginInput = loginSchema.parse(req.body);

  try {
    const tokens = await authService.login(input);

    req.log.info({}, "User logged in successfully");
    res.json(tokens);
  } catch (error) {
    next(error);
  }
}
