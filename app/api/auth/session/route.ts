import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/providers/auth/config";

// The portal runs inside an iframe on another site, so the cookie is
// third-party: it needs SameSite=None + Secure to be sent at all in production.
const isProd = process.env.NODE_ENV === "production";

/** Save the token handed over by the host app (`?id=<token>`) in an httpOnly cookie. */
export async function POST(request: Request) {
  const { token } = await request.json().catch(() => ({}));
  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json({ detail: "Missing token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, token.trim(), {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
