import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/providers/auth/config";

// Gate for pages. A visitor needs either:
//  - the `access_token` cookie (from /login or an earlier `?id=` visit), or
//  - `?id=<token>` in the URL (the host app's iframe) — <PortalProvider> saves
//    it as the cookie and validates it against the backend.
// Anything else goes to /login. Whether the token is actually *valid* is
// decided by the backend (dashboard call), not here.
// Requests under /test/* render the same pages as the root routes.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  let target = pathname;
  if (pathname === "/test" || pathname.startsWith("/test/")) {
    target = pathname.replace(/^\/test/, "") || "/";
  }

  const isLogin = target === "/login";
  const hasToken =
    searchParams.has("id") || Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);

  if (!isLogin && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", target);
    return NextResponse.redirect(loginUrl);
  }

  if (target !== pathname) {
    const url = new URL(target, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
