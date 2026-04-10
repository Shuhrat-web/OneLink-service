import { NextRequest } from "next/server";
import { canAccessLink } from "@/features/auth/require-admin";
import { forbidden, mapError, notFound, ok, unauthorized } from "@/server/api";
import { getCurrentUser } from "@/server/services/auth-service";
import { getRecentEvents } from "@/server/repositories/click-event-repository";
import { findSmartLinkById } from "@/server/repositories/smart-link-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await ctx.params;
    const link = await findSmartLinkById(id);
    if (!link) return notFound("Link not found");
    if (!canAccessLink(user, link)) return forbidden();

    const limitParam = Number(new URL(req.url).searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(200, limitParam)) : 50;

    return ok({ items: await getRecentEvents(id, limit) });
  } catch (error) {
    return mapError(error);
  }
}
