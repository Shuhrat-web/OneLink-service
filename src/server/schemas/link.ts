import { z } from "zod";
import { isValidUrl } from "@/lib/utils";

const slugRegex = /^[a-z0-9][a-z0-9-]{2,31}$/;

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || isValidUrl(value), "Must be a valid http/https URL");

const optionalDatetimeSchema = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v : undefined))
  .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Invalid datetime")
  .transform((v) => (v ? new Date(v) : undefined));

export const smartLinkCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(slugRegex, "Slug format: lowercase letters, numbers, hyphen")
    .optional(),
  iosUrl: z.string().trim().refine((v) => isValidUrl(v), "Invalid iOS URL"),
  androidUrl: z.string().trim().refine((v) => isValidUrl(v), "Invalid Android URL"),
  webUrl: z.string().trim().refine((v) => isValidUrl(v), "Invalid Web URL"),
  deepLinkUrl: optionalUrlSchema,
  isActive: z.boolean().default(true),
  expiresAt: optionalDatetimeSchema,
  maxClicks: z.number().int().positive().optional(),
  captchaEnabled: z.boolean().default(false),
  captchaMode: z.enum(["off", "always"]).default("off"),
});

export const smartLinkUpdateSchema = smartLinkCreateSchema.partial();

export const smartLinkQuerySchema = z.object({
  search: z.string().optional(),
  active: z.enum(["all", "true", "false"]).default("all"),
  captcha: z.enum(["all", "true", "false"]).default("all"),
  expired: z.enum(["all", "true", "false"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
