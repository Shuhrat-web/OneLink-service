import { z } from "zod";

export const captchaVerifySchema = z.object({
  slug: z.string().trim().min(3).max(64),
  token: z.string().trim().min(10),
});
