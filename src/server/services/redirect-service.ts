import { SmartLink } from "@prisma/client";
import { ParsedAgent } from "@/lib/user-agent";

export function pickRedirectTarget(link: SmartLink, agent: ParsedAgent): string {
  if (agent.platform === "ios") return link.iosUrl;
  if (agent.platform === "android") return link.androidUrl;
  return link.webUrl;
}
