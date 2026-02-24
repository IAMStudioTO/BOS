import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteggiamo /admin e /api/admin
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin")
  ) {
    // Non proteggiamo la pagina di login
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get("admin-auth");

    if (authCookie?.value === "authenticated") {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
