import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/providers/auth/config";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
