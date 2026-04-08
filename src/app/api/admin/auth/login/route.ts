import { NextRequest } from "next/server";
import { badRequest, mapError, ok, unauthorized } from "@/server/api";
import { loginSchema } from "@/server/schemas/auth";
import { authenticateAdmin, createAdminSession } from "@/server/services/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = loginSchema.parse(body);

    const admin = await authenticateAdmin(input.email, input.password);
    if (!admin) return unauthorized("Invalid credentials");

    await createAdminSession(admin.id);
    return ok({ id: admin.id, email: admin.email });
  } catch (error) {
    if (error instanceof SyntaxError) return badRequest("Invalid JSON");
    return mapError(error);
  }
}
