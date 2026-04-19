import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("sumaya_auth")?.value;
  const roleCookie = request.cookies.get("sumaya_role")?.value;
  const isElevatedRole =
    roleCookie === "reception" || roleCookie === "admin" || roleCookie === "owner";

  if (authCookie === "1" && isElevatedRole) {
    return NextResponse.next();
  }

  if (authCookie === "1") {
    const historyUrl = new URL("/history", request.url);
    historyUrl.searchParams.set("view", "mine");
    return NextResponse.redirect(historyUrl);
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
