import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

// Temporary demo gate: the real API/auth will replace this. Requests under
// /test/* are for embedding this app in an iframe on another site before
// that product has its own auth wired up — they render the same pages as
// the root routes but skip the login check entirely.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/test" || pathname.startsWith("/test/")) {
    const rewritten = pathname.replace(/^\/test/, "") || "/";
    return NextResponse.rewrite(new URL(rewritten, request.url));
  }

  const isAuthed = request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
  if (!isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
