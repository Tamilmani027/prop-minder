import { z } from "zod";

export const registerSchema = z.object({
  orgName: z.string().trim().min(1, "orgName is required"),
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().toLowerCase().email("invalid email"),
  password: z.string().min(8, "password must be at least 8 characters").max(72, "password must be at most 72 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("invalid email"),
  password: z.string().min(1, "password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
