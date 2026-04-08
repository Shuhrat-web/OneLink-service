import { getCurrentAdmin } from "@/server/services/auth-service";

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
