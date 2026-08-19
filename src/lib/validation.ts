import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(280).nullable(),
});
