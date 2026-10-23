import { backendFetch } from "@/lib/api/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE_OPTIONS,
} from "@/providers/auth/config";
import { NextResponse } from "next/server";

const LOGIN_URL =
  "https://live.mypcp.us/webservices/loginreactcopy/check_login";

interface LoginResponse {
  Token?: string;
  msg?: string;
}

export async function POST(request: Request) {
  const { username, password } = await request.json().catch(() => ({}));
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const form = new FormData();
  form.append("username", username);
  form.append("password", password);
  form.append("loginby", "email");

  let data: LoginResponse | null = null;
  try {
    data = await backendFetch<LoginResponse>(
      "",
      { method: "POST", body: form },
      LOGIN_URL,
    );
  } catch {
    // fall through: treated as a failed login below
  }

  // The backend answers 200 even for bad credentials — a Token is the only success signal.
  if (!data?.Token) {
    return NextResponse.json(
      { error: data?.msg || "Invalid username or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    data.Token,
    ACCESS_TOKEN_COOKIE_OPTIONS,
  );
  return response;
}
