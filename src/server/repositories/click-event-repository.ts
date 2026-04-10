import { DeviceType, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ClicksOverTimePoint = { date: string; total: number; unique: number };

function buildDateRange(days: number) {
  const dates: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    dates.push(current.toISOString().slice(0, 10));
  }

  return { start, dates };
}

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

export async function getDashboardPlatformBreakdown() {
  const rows = await prisma.clickEvent.groupBy({ by: ["platform"], _count: { _all: true } });
  const platformMap: Record<Platform, number> = { ios: 0, android: 0, web: 0 };

  for (const row of rows) {
    platformMap[row.platform] = row._count._all;
  }

  return platformMap;
}

export async function getDashboardClicksOverTime(days = 7): Promise<ClicksOverTimePoint[]> {
  const safeDays = Math.max(1, Math.min(30, days));
  const { start, dates } = buildDateRange(safeDays);

  const [totalRows, uniqueRows] = await Promise.all([
    prisma.clickEvent.groupBy({
      by: ["clickedAt"],
      where: { clickedAt: { gte: start } },
      _count: { _all: true },
    }),
    prisma.clickEvent.groupBy({
      by: ["clickedAt"],
      where: { clickedAt: { gte: start }, isUnique: true },
      _count: { _all: true },
    }),
  ]);

  const totalMap = new Map<string, number>();
  for (const row of totalRows) {
    const key = row.clickedAt.toISOString().slice(0, 10);
    totalMap.set(key, (totalMap.get(key) ?? 0) + row._count._all);
  }

  const uniqueMap = new Map<string, number>();
  for (const row of uniqueRows) {
    const key = row.clickedAt.toISOString().slice(0, 10);
    uniqueMap.set(key, (uniqueMap.get(key) ?? 0) + row._count._all);
  }

  return dates.map((date) => ({
    date,
    total: totalMap.get(date) ?? 0,
    unique: uniqueMap.get(date) ?? 0,
  }));
}

export async function getLinkClicksOverTime(smartLinkId: string, days = 7): Promise<ClicksOverTimePoint[]> {
  const safeDays = Math.max(1, Math.min(30, days));
  const { start, dates } = buildDateRange(safeDays);

  const [totalRows, uniqueRows] = await Promise.all([
    prisma.clickEvent.groupBy({
      by: ["clickedAt"],
      where: { smartLinkId, clickedAt: { gte: start } },
      _count: { _all: true },
    }),
    prisma.clickEvent.groupBy({
      by: ["clickedAt"],
      where: { smartLinkId, clickedAt: { gte: start }, isUnique: true },
      _count: { _all: true },
    }),
  ]);

  const totalMap = new Map<string, number>();
  for (const row of totalRows) {
    const key = row.clickedAt.toISOString().slice(0, 10);
    totalMap.set(key, (totalMap.get(key) ?? 0) + row._count._all);
  }

  const uniqueMap = new Map<string, number>();
  for (const row of uniqueRows) {
    const key = row.clickedAt.toISOString().slice(0, 10);
    uniqueMap.set(key, (uniqueMap.get(key) ?? 0) + row._count._all);
  }

  return dates.map((date) => ({
    date,
    total: totalMap.get(date) ?? 0,
    unique: uniqueMap.get(date) ?? 0,
  }));
}
