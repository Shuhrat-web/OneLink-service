import { NextRequest } from "next/server";
import { mapError, ok, unauthorized } from "@/server/api";
import { getCurrentAdmin } from "@/server/services/auth-service";
import { getRecentEvents } from "@/server/repositories/click-event-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorized();

    const { id } = await ctx.params;
    const limitParam = Number(new URL(req.url).searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(200, limitParam)) : 50;

    return ok({ items: await getRecentEvents(id, limit) });
  } catch (error) {
    return mapError(error);
  }
}
