import { NextRequest, NextResponse } from "next/server";
import { findSmartLinkBySlug } from "@/server/repositories/smart-link-repository";
import { resolveAvailability } from "@/server/services/link-rules-service";
import { parseUserAgent } from "@/lib/user-agent";
import { pickRedirectTarget } from "@/server/services/redirect-service";
import { recordClickEvent } from "@/server/services/analytics-service";
import { withLinkPrefix } from "@/lib/env";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const link = await findSmartLinkBySlug(slug);
  const availability = await resolveAvailability(link);

  if (availability !== "ok" || !link) {
    return NextResponse.redirect(new URL(`/status?type=${availability}`, req.url));
  }

  if (link.captchaEnabled && link.captchaMode === "always") {
    return NextResponse.redirect(new URL(withLinkPrefix(`/captcha/${slug}`), req.url));
  }

  const agent = parseUserAgent(req.headers.get("user-agent"));
  const target = pickRedirectTarget(link, agent);
  await recordClickEvent({ req, link, redirectTarget: target, captchaPassed: false });

  return NextResponse.redirect(target, { status: 302 });
}
