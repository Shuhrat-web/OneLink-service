import crypto from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getAuthSecret } from "@/lib/env";
import { findUserByEmail, findUserById } from "@/server/repositories/admin-user-repository";

const COOKIE_NAME = "admin_session";
const SESSION_AGE_SEC = 60 * 60 * 24 * 7;

type SessionPayload = { sub: string; exp: number };

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(data).digest("base64url");
}

function encode(payload: SessionPayload): string {
  const raw = base64url(JSON.stringify(payload));
  return `${raw}.${sign(raw)}`;
}

function decode(token: string): SessionPayload | null {
  const [raw, signature] = token.split(".");
  if (!raw || !signature) return null;
  if (sign(raw) !== signature) return null;

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionPayload;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (!user.isActive) return null;
  return (await bcrypt.compare(password, user.passwordHash)) ? user : null;
}

export async function createAdminSession(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_AGE_SEC;
  const token = encode({ sub: userId, exp });
  const cookieStore = await cookies();

  const explicitCookieSecure = process.env.COOKIE_SECURE;
  const secure =
    explicitCookieSecure === "true"
      ? true
      : explicitCookieSecure === "false"
        ? false
        : (process.env.APP_BASE_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production");

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_AGE_SEC,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = decode(token);
  if (!payload) return null;

  const user = await findUserById(payload.sub);
  if (!user?.isActive) return null;
  return user;
}

export async function getCurrentAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}
