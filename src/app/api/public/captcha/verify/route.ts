import { NextRequest } from "next/server";
import { badRequest, mapError, ok } from "@/server/api";
import { captchaVerifySchema } from "@/server/schemas/captcha";
import { verifyTurnstileToken } from "@/server/services/captcha-service";
import { findSmartLinkBySlug } from "@/server/repositories/smart-link-repository";
import { resolveAvailability } from "@/server/services/link-rules-service";
import { parseUserAgent } from "@/lib/user-agent";
import { pickRedirectTarget } from "@/server/services/redirect-service";
import { recordClickEvent } from "@/server/services/analytics-service";
import { getClientIp } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = captchaVerifySchema.parse(body);

    const link = await findSmartLinkBySlug(input.slug);
    const state = await resolveAvailability(link);

    if (state !== "ok" || !link) return badRequest("Link unavailable", { state });
    if (!link.captchaEnabled || link.captchaMode !== "always") return badRequest("Captcha is disabled for this link");

    const valid = await verifyTurnstileToken(input.token, getClientIp(req));
    if (!valid) return badRequest("Captcha verification failed");

    const agent = parseUserAgent(req.headers.get("user-agent"));
    const target = pickRedirectTarget(link, agent);

    await recordClickEvent({ req, link, redirectTarget: target, captchaPassed: true });

    return ok({ redirectUrl: target });
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON");
    return mapError(error);
  }
}
