import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth is no longer gated here: the host app embeds us in an iframe with
// `?id=<token>`, and <PortalProvider> saves that token and validates it
// against the backend. Requests under /test/* render the same pages as the
// root routes (kept for the embedding URL).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/test" || pathname.startsWith("/test/")) {
    const rewritten = pathname.replace(/^\/test/, "") || "/";
    const url = new URL(rewritten, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
