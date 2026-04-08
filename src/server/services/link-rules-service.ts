import { SmartLink } from "@prisma/client";
import { countSmartLinkClicks } from "@/server/repositories/click-event-repository";

export type LinkAvailabilityStatus =
  | "ok"
  | "not_found"
  | "inactive"
  | "expired"
  | "click_limit_reached";

export async function resolveAvailability(link: SmartLink | null): Promise<LinkAvailabilityStatus> {
  if (!link) return "not_found";
  if (!link.isActive) return "inactive";
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) return "expired";

  if (typeof link.maxClicks === "number") {
    const total = await countSmartLinkClicks(link.id);
    if (total >= link.maxClicks) return "click_limit_reached";
  }

  return "ok";
}
