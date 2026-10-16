import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { register, login } from "./auth.service";
import type { RegisterInput, LoginInput } from "./auth.schema";

export const registerController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const input = res.locals.validated.body as RegisterInput;
  const result = await register(input);
  res.status(201).json({ data: result });
};

export const loginController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const input = res.locals.validated.body as LoginInput;
  const result = await login(input);
  res.json({ data: result });
};
