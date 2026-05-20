import { NextRequest, NextResponse } from "next/server";
import {
  ONBOARDING_TOKEN_COOKIE,
  SESSION_TOKEN_COOKIE,
} from "@/lib/onboarding/token";

const isProd = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  // Token is in an HttpOnly cookie — JS never touches it.
  const token = req.cookies.get(ONBOARDING_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Unauthorized — onboarding session expired. Please log in again.",
      },
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const endpoint = `${baseUrl}/onboarding.create-user`;

  console.log("\n── [onboarding/submit] Outgoing request ──────────────────");
  console.log("URL    :", endpoint);
  console.log("Payload:", JSON.stringify(body, null, 2));

  // Generous timeout — upstream onboarding can be slow on first user creation.
  const TIMEOUT_MS = 45_000;

  async function callUpstream(): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  let upstream: Response;
  try {
    upstream = await callUpstream();
  } catch (err) {
    // Retry once on transient network/abort errors.
    const reason =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(
      "[onboarding/submit] upstream fetch failed, retrying:",
      reason,
    );
    try {
      upstream = await callUpstream();
    } catch (err2) {
      const reason2 =
        err2 instanceof Error ? `${err2.name}: ${err2.message}` : String(err2);
      console.error(
        "[onboarding/submit] upstream fetch failed (retry):",
        reason2,
      );
      return NextResponse.json(
        {
          error: "Could not reach the upstream API. Please try again.",
          detail: reason2,
        },
        { status: 502 },
      );
    }
  }

  const data = (await upstream.json().catch(() => null)) as {
    success?: boolean;
    status?: number;
    data?: { session_token?: string; [key: string]: unknown };
    [key: string]: unknown;
  } | null;

  console.log("\n── [onboarding/submit] Upstream response ─────────────────");
  console.log("Status :", upstream.status, upstream.statusText);
  console.log("Body   :", JSON.stringify(data, null, 2));
  console.log("──────────────────────────────────────────────────────────\n");

  // Upstream sometimes returns HTTP 200 with a body indicating a 401
  // (expired onboarding token). Normalize that to a real 401 so the
  // client can trigger the re-verify flow consistently.
  let responseStatus = upstream.status;
  if (
    upstream.status === 200 &&
    data?.success === false &&
    data?.status === 401
  ) {
    responseStatus = 401;
  }

  const res = NextResponse.json(data ?? {}, { status: responseStatus });

  // If the API returned a session_token, store it as an HttpOnly cookie
  // so JS never has to read or store it on the client.
  const sessionToken = data?.data?.session_token;
  if (typeof sessionToken === "string" && sessionToken.length > 0) {
    res.cookies.set(SESSION_TOKEN_COOKIE, sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
    });
  }

  return res;
}
