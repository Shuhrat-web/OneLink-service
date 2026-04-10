import { NextResponse, type NextRequest } from "next/server";
import { getLinkPrefix } from "@/lib/env";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const prefix = getLinkPrefix();
  if (prefix && pathname.startsWith(`/${prefix}/`)) {
    const rest = pathname.slice(prefix.length + 1);
    if (rest !== "/" && !rest.startsWith("/admin") && !rest.startsWith("/api") && !rest.startsWith("/_next")) {
      const url = req.nextUrl.clone();
      url.pathname = rest;
      return NextResponse.rewrite(url);
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("admin_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/:path*"] };
