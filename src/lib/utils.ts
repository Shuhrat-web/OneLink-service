import crypto from "crypto";
import { getHashSalt } from "@/lib/env";

export function hashString(value: string): string {
  return crypto.createHash("sha256").update(`${getHashSalt()}:${value}`).digest("hex");
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase();
}

export function generateSlug(length = 7): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
