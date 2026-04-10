import { Prisma } from "@prisma/client";
import { generateSlug, normalizeSlug } from "@/lib/utils";
import {
  createSmartLink,
  deleteSmartLink,
  findSmartLinkById,
  findSmartLinkBySlug,
  listSmartLinks,
  updateSmartLink,
} from "@/server/repositories/smart-link-repository";

type CreateInput = {
  title: string;
  description?: string;
  slug?: string;
  iosUrl: string;
  androidUrl: string;
  webUrl: string;
  deepLinkUrl?: string;
  isActive?: boolean;
  expiresAt?: Date;
  maxClicks?: number;
  captchaEnabled?: boolean;
  captchaMode?: "off" | "always";
};

type CurrentUser = { id: string; role: "admin" | "user" };

async function ensureUniqueSlug(preferred?: string): Promise<string> {
  if (preferred) {
    const slug = normalizeSlug(preferred);
    const existing = await findSmartLinkBySlug(slug);
    if (existing) throw new Error("Slug already exists");
    return slug;
  }

  for (let i = 0; i < 10; i++) {
    const slug = generateSlug(7);
    if (!(await findSmartLinkBySlug(slug))) return slug;
  }

  throw new Error("Unable to generate unique slug");
}

export async function createSmartLinkUseCase(input: CreateInput, ownerId: string) {
  const slug = await ensureUniqueSlug(input.slug);

  return createSmartLink({
    title: input.title,
    description: input.description,
    slug,
    iosUrl: input.iosUrl,
    androidUrl: input.androidUrl,
    webUrl: input.webUrl,
    deepLinkUrl: input.deepLinkUrl,
    isActive: input.isActive ?? true,
    expiresAt: input.expiresAt,
    maxClicks: input.maxClicks,
    captchaEnabled: input.captchaEnabled ?? false,
    captchaMode: input.captchaMode ?? "off",
    owner: { connect: { id: ownerId } },
  });
}

export async function updateSmartLinkUseCase(id: string, input: Partial<CreateInput>) {
  const current = await findSmartLinkById(id);
  if (!current) throw new Error("Link not found");

  let slug: string | undefined;
  if (input.slug && input.slug !== current.slug) slug = await ensureUniqueSlug(input.slug);

  const data: Prisma.SmartLinkUpdateInput = {
    title: input.title,
    description: input.description,
    slug,
    iosUrl: input.iosUrl,
    androidUrl: input.androidUrl,
    webUrl: input.webUrl,
    deepLinkUrl: input.deepLinkUrl,
    isActive: input.isActive,
    expiresAt: input.expiresAt,
    maxClicks: input.maxClicks,
    captchaEnabled: input.captchaEnabled,
    captchaMode: input.captchaMode,
  };

  return updateSmartLink(id, data);
}

export async function listSmartLinksUseCase(params: {
  search?: string;
  active: "all" | "true" | "false";
  captcha: "all" | "true" | "false";
  expired: "all" | "true" | "false";
  page: number;
  pageSize: number;
}, currentUser: CurrentUser) {
  return listSmartLinks({
    search: params.search,
    active: params.active === "all" ? undefined : params.active === "true",
    captchaEnabled: params.captcha === "all" ? undefined : params.captcha === "true",
    expired: params.expired === "all" ? undefined : params.expired === "true",
    ownerId: currentUser.role === "admin" ? undefined : currentUser.id,
    page: params.page,
    pageSize: params.pageSize,
  });
}

export async function deleteSmartLinkUseCase(id: string) {
  return deleteSmartLink(id);
}
