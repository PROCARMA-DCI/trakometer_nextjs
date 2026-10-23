import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE_OPTIONS } from "@/providers/auth/config";

/** Save the token handed over by the host app (`?id=<token>`) in an httpOnly cookie. */
export async function POST(request: Request) {
  const { token } = await request.json().catch(() => ({}));
  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json({ detail: "Missing token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, token.trim(), ACCESS_TOKEN_COOKIE_OPTIONS);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
