import { NextRequest } from "next/server";
import { badRequest, mapError, notFound, ok, unauthorized } from "@/server/api";
import { getCurrentUser } from "@/server/services/auth-service";
import { userUpdateSchema } from "@/server/schemas/user";
import { getUserByIdUseCase, updateUserUseCase } from "@/server/services/user-service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (currentUser.role !== "admin") return unauthorized();

    const { id } = await ctx.params;
    const user = await getUserByIdUseCase(id);
    if (!user) return notFound("User not found");

    return ok(user);
  } catch (error) {
    return mapError(error);
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (currentUser.role !== "admin") return unauthorized();

    const body = await req.json();
    const input = userUpdateSchema.parse(body);
    const { id } = await ctx.params;

    const existingUser = await getUserByIdUseCase(id);
    if (!existingUser) return notFound("User not found");

    const updated = await updateUserUseCase(id, input);
    return ok(updated);
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON");
    return mapError(error);
  }
}
