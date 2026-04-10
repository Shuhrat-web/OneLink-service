const requiredEnv = [
  "DATABASE_URL",
  "APP_BASE_URL",
  "AUTH_SECRET",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
] as const;

export function validateEnv() {
  for (const key of requiredEnv) {
    if (!process.env[key] && process.env.NODE_ENV === "production") {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-auth-secret-change-me";
}

export function getHashSalt(): string {
  return process.env.APP_HASH_SALT ?? getAuthSecret();
}

function normalizeLinkPrefix(raw: string | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.trim().replace(/^\/+|\/+$/g, "");
  return normalized.length > 0 ? normalized : null;
}

export function getLinkPrefix(): string | null {
  return normalizeLinkPrefix(process.env.LINK_PREFIX);
}

export function withLinkPrefix(path: string): string {
  const prefix = getLinkPrefix();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return prefix ? `/${prefix}${normalizedPath}` : normalizedPath;
}
