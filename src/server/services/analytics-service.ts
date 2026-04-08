import { NextRequest } from "next/server";
import { SmartLink } from "@prisma/client";
import { parseUserAgent } from "@/lib/user-agent";
import { getClientIp, getCountry } from "@/lib/http";
import { hashString } from "@/lib/utils";
import { createClickEvent, hasRecentUniqueFingerprint } from "@/server/repositories/click-event-repository";

export async function recordClickEvent(params: {
  req: NextRequest;
  link: SmartLink;
  redirectTarget: string;
  captchaPassed: boolean;
}) {
  const { req, link, redirectTarget, captchaPassed } = params;

  const userAgent = req.headers.get("user-agent");
  const agent = parseUserAgent(userAgent);

  const ip = getClientIp(req);
  const fingerprint = `${ip}|${userAgent ?? "unknown"}`;
  const ipHash = hashString(fingerprint);

  const seenRecently = await hasRecentUniqueFingerprint(link.id, ipHash, userAgent, 24);

  await createClickEvent({
    smartLinkId: link.id,
    platform: agent.platform,
    os: agent.os,
    browser: agent.browser,
    deviceType: agent.deviceType,
    userAgent,
    referrer: req.headers.get("referer"),
    country: getCountry(req),
    ipHash,
    isUnique: !seenRecently,
    captchaPassed,
    redirectTarget,
  });
}
