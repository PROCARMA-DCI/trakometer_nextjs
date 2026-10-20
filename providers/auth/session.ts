import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "./config";
// Server-only. Do not import from a "use client" file —
// next/headers throws at build time if you try.

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}
