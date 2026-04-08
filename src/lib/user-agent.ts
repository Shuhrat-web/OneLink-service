import { DeviceType, Platform } from "@prisma/client";
import { UAParser } from "ua-parser-js";

export type ParsedAgent = {
  platform: Platform;
  os: string | null;
  browser: string | null;
  deviceType: DeviceType;
};

export function parseUserAgent(userAgent: string | null): ParsedAgent {
  const parser = new UAParser(userAgent ?? "");
  const result = parser.getResult();

  const osName = result.os.name ?? null;
  const browserName = result.browser.name ?? null;

  const isIOS = osName ? /iOS/i.test(osName) : false;
  const isAndroid = osName ? /Android/i.test(osName) : false;
  const platform: Platform = isIOS ? "ios" : isAndroid ? "android" : "web";

  let deviceType: DeviceType;
  switch (result.device.type) {
    case "mobile":
      deviceType = "mobile";
      break;
    case "tablet":
      deviceType = "tablet";
      break;
    default:
      deviceType = /bot|spider|crawler/i.test(userAgent ?? "") ? "bot" : "desktop";
  }

  return { platform, os: osName, browser: browserName, deviceType };
}
