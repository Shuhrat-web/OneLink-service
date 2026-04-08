import { DeviceType, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createClickEvent(data: {
  smartLinkId: string;
  platform: Platform;
  os: string | null;
  browser: string | null;
  deviceType: DeviceType;
  userAgent: string | null;
  referrer: string | null;
  country: string | null;
  ipHash: string | null;
  isUnique: boolean;
  captchaPassed: boolean;
  redirectTarget: string;
}) {
  return prisma.clickEvent.create({ data });
}

export async function countSmartLinkClicks(smartLinkId: string) {
  return prisma.clickEvent.count({ where: { smartLinkId } });
}

export async function hasRecentUniqueFingerprint(
  smartLinkId: string,
  ipHash: string,
  userAgent: string | null,
  windowHours: number,
) {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const existing = await prisma.clickEvent.findFirst({
    where: { smartLinkId, ipHash, userAgent, clickedAt: { gte: since } },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function getLinkStats(smartLinkId: string) {
  const [totalClicks, uniqueClicks, lastClick, platforms] = await Promise.all([
    prisma.clickEvent.count({ where: { smartLinkId } }),
    prisma.clickEvent.count({ where: { smartLinkId, isUnique: true } }),
    prisma.clickEvent.findFirst({
      where: { smartLinkId },
      orderBy: { clickedAt: "desc" },
      select: { clickedAt: true },
    }),
    prisma.clickEvent.groupBy({ by: ["platform"], where: { smartLinkId }, _count: { _all: true } }),
  ]);

  const platformMap: Record<Platform, number> = { ios: 0, android: 0, web: 0 };
  for (const row of platforms) platformMap[row.platform] = row._count._all;

  return {
    totalClicks,
    uniqueClicks,
    lastClickAt: lastClick?.clickedAt ?? null,
    platformBreakdown: platformMap,
  };
}

export async function getRecentEvents(smartLinkId: string, limit = 50) {
  return prisma.clickEvent.findMany({ where: { smartLinkId }, orderBy: { clickedAt: "desc" }, take: limit });
}

export async function getDashboardAggregates() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalLinks, activeLinks, totalClicks, clicksToday] = await Promise.all([
    prisma.smartLink.count(),
    prisma.smartLink.count({ where: { isActive: true } }),
    prisma.clickEvent.count(),
    prisma.clickEvent.count({ where: { clickedAt: { gte: startOfDay } } }),
  ]);

  return { totalLinks, activeLinks, totalClicks, clicksToday };
}
