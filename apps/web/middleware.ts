import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Non proteggiamo login page e login api
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isAdminPage || isAdminApi) {
    if (isLoginPage || isLoginApi) {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get("admin-auth");

    if (authCookie?.value === "authenticated") {
      return NextResponse.next();
    }

    // Se chiamano API senza auth, meglio 401 invece di redirect
    if (isAdminApi) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
