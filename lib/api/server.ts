import { BASE_URL } from "@/config";

export class ApiError extends Error {
  status: number;
  /** Parsed backend error body (e.g. `{ detail }`), so proxies can pass it on. */
  body: unknown;
  constructor(status: number, body: unknown) {
    super(typeof body === "string" ? body : `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
  baseUrl: string = BASE_URL,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, init);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, payload ?? "Request failed");
  }

  return (payload && payload) as T;
}

export async function authorizedFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {},
  baseUrl: string = BASE_URL,
): Promise<T> {
  return backendFetch<T>(
    path,
    {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `${token}`,
      },
    },
    baseUrl,
  );
}
