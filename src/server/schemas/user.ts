import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "user"]);

export const userCreateSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  role: userRoleSchema.default("user"),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  email: z.string().trim().email().optional(),
  password: z.string().min(6).max(128).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});
