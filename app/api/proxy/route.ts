// app/api/proxy/route.ts
//
// Generic backend proxy that attaches the HttpOnly session cookie as a Bearer
// token so client-side JS never has to read it.
//
// Usage (client-side):
//   POST /api/proxy  { path: "goals.find",    method: "GET" }
//   POST /api/proxy  { path: "goals.create",  method: "POST",   body: {...} }
//   POST /api/proxy  { path: "goals.update",  method: "PUT",    body: {...} }
//   POST /api/proxy  { path: "goals.delete",  method: "DELETE", body: {...} }

import { NextRequest, NextResponse } from "next/server";
import { SESSION_TOKEN_COOKIE } from "@/lib/onboarding/token";

// ── Whitelist ──────────────────────────────────────────────────────────────
// Only these backend path prefixes are allowed to prevent SSRF.
const ALLOWED_PATH_PREFIXES = [
  "user.", // user.get, user.update
  "goals.",
  "cashflow.",
  "assets.",
  "insurance.",
  "properties.",
  "liabilities.",
  "auth.refresh-session",
  "auth.revoke-session",
] as const;

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized — session expired." },
      { status: 401 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing API base URL." },
      { status: 500 },
    );
  }

  let envelope: { path: string; method?: string; body?: unknown };
  try {
    envelope = (await req.json()) as {
      path: string;
      method?: string;
      body?: unknown;
    };
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { path, method = "GET", body } = envelope;

  if (typeof path !== "string" || !isAllowedPath(path)) {
    return NextResponse.json(
      { error: "Forbidden — unknown API path." },
      { status: 403 },
    );
  }

  const endpoint = `${baseUrl}/${path}`;

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(method !== "GET" && body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
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
