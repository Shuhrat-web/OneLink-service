import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/server/services/auth-service";

export async function POST(request: Request) {
  await destroyAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
