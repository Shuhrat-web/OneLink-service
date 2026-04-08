import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SmartLinkListFilter = {
  search?: string;
  active?: boolean;
  captchaEnabled?: boolean;
  expired?: boolean;
  page: number;
  pageSize: number;
};

export async function findSmartLinkBySlug(slug: string) {
  return prisma.smartLink.findUnique({ where: { slug } });
}

export async function findSmartLinkById(id: string) {
  return prisma.smartLink.findUnique({ where: { id } });
}

export async function createSmartLink(data: Prisma.SmartLinkCreateInput) {
  return prisma.smartLink.create({ data });
}

export async function updateSmartLink(id: string, data: Prisma.SmartLinkUpdateInput) {
  return prisma.smartLink.update({ where: { id }, data });
}

export async function deleteSmartLink(id: string) {
  return prisma.smartLink.delete({ where: { id } });
}

export async function listSmartLinks(filter: SmartLinkListFilter) {
  const now = new Date();
  const where: Prisma.SmartLinkWhereInput = {
    AND: [
      filter.search
        ? {
            OR: [
              { title: { contains: filter.search, mode: "insensitive" } },
              { slug: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {},
      typeof filter.active === "boolean" ? { isActive: filter.active } : {},
      typeof filter.captchaEnabled === "boolean" ? { captchaEnabled: filter.captchaEnabled } : {},
      typeof filter.expired === "boolean"
        ? filter.expired
          ? { expiresAt: { lt: now } }
          : { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.smartLink.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
    }),
    prisma.smartLink.count({ where }),
  ]);

  return { items, total };
}
