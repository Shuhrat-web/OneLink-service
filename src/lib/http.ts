import { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "0.0.0.0";
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export function getCountry(req: NextRequest): string | null {
  return req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country");
}
