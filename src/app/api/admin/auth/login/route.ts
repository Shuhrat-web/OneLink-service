import { NextRequest } from "next/server";
import { badRequest, mapError, ok, unauthorized } from "@/server/api";
import { loginSchema } from "@/server/schemas/auth";
import { authenticateUser, createAdminSession } from "@/server/services/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = loginSchema.parse(body);

    const user = await authenticateUser(input.email, input.password);
    if (!user) return unauthorized("Invalid credentials");

    await createAdminSession(user.id);
    return ok({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON");
    return mapError(error);
  }
}
