import { NextRequest } from "next/server";
import { badRequest, created, mapError, ok, unauthorized } from "@/server/api";
import { getCurrentUser } from "@/server/services/auth-service";
import { userCreateSchema } from "@/server/schemas/user";
import { createUserUseCase, listUsersUseCase } from "@/server/services/user-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return unauthorized();

    return ok(await listUsersUseCase());
  } catch (error) {
    return mapError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return unauthorized();

    const body = await req.json();
    const input = userCreateSchema.parse(body);

    const createdUser = await createUserUseCase(input);
    return created(createdUser);
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON");
    return mapError(error);
  }
}
