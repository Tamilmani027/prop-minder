import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError";
import { env } from "../../config/env";

// Verifies the JWT issued by auth/register and auth/login and exposes the
// authenticated user's id and orgId on res.locals.auth so downstream services
// can scope every query to the caller's organization.
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    // jwtSecret is required at runtime; .env.example provides a placeholder.
    const payload = jwt.verify(token, env.jwtSecret!) as {
      userId: string;
      orgId: string;
    };
    // res.locals doesn't declare 'auth' in its type; cast through any to attach it.
    (res as any).locals.auth = { userId: payload.userId, orgId: payload.orgId };
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
};
