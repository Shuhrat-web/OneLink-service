import { getCurrentUser } from "@/server/services/auth-service";

type LinkWithOwner = { ownerId: string };

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export function canAccessLink(user: { id: string; role: "admin" | "user" }, link: LinkWithOwner) {
  return user.role === "admin" || link.ownerId === user.id;
}

export function canManageLink(user: { id: string; role: "admin" | "user" }, link: LinkWithOwner) {
  return canAccessLink(user, link);
}
