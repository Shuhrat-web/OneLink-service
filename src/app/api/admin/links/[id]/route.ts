import { NextRequest } from "next/server";
import { badRequest, mapError, notFound, ok, unauthorized } from "@/server/api";
import { getCurrentAdmin } from "@/server/services/auth-service";
import { smartLinkUpdateSchema } from "@/server/schemas/link";
import { deleteSmartLinkUseCase, updateSmartLinkUseCase } from "@/server/services/smart-link-service";
import { findSmartLinkById } from "@/server/repositories/smart-link-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorized();

    const { id } = await ctx.params;
    const link = await findSmartLinkById(id);
    if (!link) return notFound("Link not found");

    return ok(link);
  } catch (error) {
    return mapError(error);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorized();

    const body = await req.json();
    const input = smartLinkUpdateSchema.parse(body);
    const { id } = await ctx.params;

    const updated = await updateSmartLinkUseCase(id, {
      ...input,
      expiresAt: input.expiresAt,
    });

    return ok(updated);
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON");
    return mapError(error);
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorized();

    const { id } = await ctx.params;
    await deleteSmartLinkUseCase(id);

    return ok({ success: true });
  } catch (error) {
    return mapError(error);
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const form = await req.formData();
  if (form.get("_method") === "DELETE") {
    const admin = await getCurrentAdmin();
    if (!admin) return unauthorized();

    const { id } = await ctx.params;
    await deleteSmartLinkUseCase(id);

    return Response.redirect(new URL("/admin/links", req.url));
  }
  return notFound();
}
