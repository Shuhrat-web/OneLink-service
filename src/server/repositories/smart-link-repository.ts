import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SmartLinkListFilter = {
  search?: string;
  active?: boolean;
  captchaEnabled?: boolean;
  expired?: boolean;
  ownerId?: string;
  page: number;
  pageSize: number;
};

export async function findSmartLinkBySlug(slug: string) {
  return prisma.smartLink.findUnique({ where: { slug } });
}

export async function findSmartLinkById(id: string) {
  return prisma.smartLink.findUnique({
    where: { id },
    include: { owner: { select: { id: true, email: true, role: true } } },
  });
}

export async function createSmartLink(data: Prisma.SmartLinkCreateInput) {
  return prisma.smartLink.create({
    data,
    include: { owner: { select: { id: true, email: true, role: true } } },
  });
}

export async function updateSmartLink(id: string, data: Prisma.SmartLinkUpdateInput) {
  return prisma.smartLink.update({
    where: { id },
    data,
    include: { owner: { select: { id: true, email: true, role: true } } },
  });
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
      filter.ownerId ? { ownerId: filter.ownerId } : {},
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
      include: { owner: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize,
    }),
    prisma.smartLink.count({ where }),
  ]);

  return { items, total };
}
