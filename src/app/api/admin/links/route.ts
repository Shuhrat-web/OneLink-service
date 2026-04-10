import { NextRequest } from "next/server";
import { badRequest, created, mapError, ok, unauthorized } from "@/server/api";
import { getCurrentUser } from "@/server/services/auth-service";
import { smartLinkCreateSchema, smartLinkQuerySchema } from "@/server/schemas/link";
import { createSmartLinkUseCase, listSmartLinksUseCase } from "@/server/services/smart-link-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const input = smartLinkQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      active: searchParams.get("active") ?? undefined,
      captcha: searchParams.get("captcha") ?? undefined,
      expired: searchParams.get("expired") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    const result = await listSmartLinksUseCase(input, user);
    return ok(result);
  } catch (error) {
    return mapError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const input = smartLinkCreateSchema.parse(body);

    const link = await createSmartLinkUseCase({
      ...input,
      expiresAt: input.expiresAt,
    }, user.id);

    return created(link);
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON");
    return mapError(error);
  }
}
