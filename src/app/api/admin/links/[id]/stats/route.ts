import { NextRequest } from "next/server";
import { canAccessLink } from "@/features/auth/require-admin";
import { forbidden, mapError, notFound, ok, unauthorized } from "@/server/api";
import { getCurrentUser } from "@/server/services/auth-service";
import { getLinkStats } from "@/server/repositories/click-event-repository";
import { findSmartLinkById } from "@/server/repositories/smart-link-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await ctx.params;
    const link = await findSmartLinkById(id);
    if (!link) return notFound("Link not found");
    if (!canAccessLink(user, link)) return forbidden();

    return ok(await getLinkStats(id));
  } catch (error) {
    return mapError(error);
  }
}
