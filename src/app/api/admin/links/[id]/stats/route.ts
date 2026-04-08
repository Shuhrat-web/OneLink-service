import { NextRequest } from "next/server";
import { mapError, ok, unauthorized } from "@/server/api";
import { getCurrentAdmin } from "@/server/services/auth-service";
import { getLinkStats } from "@/server/repositories/click-event-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorized();

    const { id } = await ctx.params;
    return ok(await getLinkStats(id));
  } catch (error) {
    return mapError(error);
  }
}
