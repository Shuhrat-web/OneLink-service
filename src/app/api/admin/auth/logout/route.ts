import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/server/services/auth-service";

export async function POST(request: Request) {
  await destroyAdminSession();
  const origin = request.headers.get("origin");
  return NextResponse.redirect(new URL("/admin/login", origin ?? request.url));
}
