import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { BASE_URL } from "@/config";
import { ApiError, backendFetch } from "@/lib/api/server";
import { getAccessToken } from "@/providers/auth/session";

const RESOURCE_BACKENDS: Record<string, string> = {
  // Example — a resource served by a DIFFERENT backend:
  // weather: process.env.OTHER_API_URL ?? "",
  react: process.env.BASE_URL ?? "",
};

async function proxy(request: NextRequest, slugParts: string[]) {
  const [resource, ...rest] = slugParts;
  // Different server if listed, otherwise the default backend.
  const baseUrl = RESOURCE_BACKENDS[resource] ?? BASE_URL;

  const backendPath = `/${resource}${rest.length ? `/${rest.join("/")}` : ""}${request.nextUrl.search}`;

  // No token → 401 so the client (`fetching`) can send the user to /login.
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
  const headers: Record<string, string> = { Authorization: `${token}` };

  const hasBody = !["GET", "HEAD"].includes(request.method);
  if (hasBody) {
    // Forward the exact bytes + content-type (multipart boundary and all) —
    // this works for both JSON and file-uploading forms without needing to
    // know which one it is.
    const contentType = request.headers.get("content-type");
    if (contentType) headers["content-type"] = contentType;
  }

  try {
    const data = await backendFetch(
      backendPath,
      {
        method: request.method,
        headers,
        body: hasBody ? await request.blob() : undefined,
      },
      baseUrl,
    );
    return NextResponse.json(data);
  } catch (err) {
    // Pass the backend's real status/body through (401, 422, …) instead of a blanket 502.
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { detail: err.message }, {
        status: err.status,
      });
    }
    return NextResponse.json(
      { detail: "Failed to reach backend" },
      { status: 502 },
    );
  }
}

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
