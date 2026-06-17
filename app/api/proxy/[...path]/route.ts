// app/api/proxy/[...path]/route.ts
//
// Runtime proxy for unauthenticated auth/onboarding OTP endpoints.
// Login and signup call /api/proxy/onboarding.* and /api/proxy/auth.* directly.
// Unlike next.config rewrites, this reads NEXT_PUBLIC_BASE_API_URL at request time
// so Vercel deploys work even when the env var was missing at build time.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PUBLIC_PATHS = new Set([
  "onboarding.generate-otp",
  "onboarding.verify-otp",
  "auth.request-otp",
  "auth.verify-otp",
]);

async function proxyPublicPath(req: NextRequest, path: string) {
  if (!PUBLIC_PATHS.has(path)) {
    return NextResponse.json(
      { error: "Forbidden — unknown API path." },
      { status: 403 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing API base URL." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const endpoint = `${baseUrl}/${path}`;

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the upstream API. Please try again." },
      { status: 502 },
    );
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: upstream.status });
}

function methodNotAllowed(path: string) {
  return NextResponse.json(
    {
      success: false,
      message: `Endpoint '${path}' only accepts POST requests.`,
    },
    { status: 405 },
  );
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  return methodNotAllowed(segments.join("/"));
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const path = segments.join("/");
  return proxyPublicPath(req, path);
}
