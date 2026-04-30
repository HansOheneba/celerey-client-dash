// lib/onboarding/api.ts
import type { OnboardingPayload, OnboardingResponse } from "./types";

/** Thrown when the onboarding token has expired and the user must re-verify. */
export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenExpiredError";
  }
}

/**
 * Submits the full onboarding payload to the backend via the secure
 * server-side route, which attaches the HttpOnly onboarding_token cookie
 * as a Bearer token header so JS never has to read it.
 *
 * Returns the full API response so callers can access the created user data
 * and session_token (which is also set as an HttpOnly cookie by the route).
 *
 * Throws `TokenExpiredError` when the onboarding token has expired.
 */
export async function submitOnboarding(
  payload: OnboardingPayload,
): Promise<OnboardingResponse> {
  const response = await fetch("/api/onboarding/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | (OnboardingResponse & {
        status?: number;
      })
    | null;

  // The upstream API returns HTTP 200 with success:false + status:401 when
  // the onboarding token has expired.
  const isTokenExpired =
    data?.status === 401 ||
    (data?.message ?? "").toLowerCase().includes("token");

  if ((!response.ok || data?.success === false) && isTokenExpired) {
    throw new TokenExpiredError(
      data?.message ?? "Your session has expired. Please re-verify your email.",
    );
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ??
        data?.error ??
        "Failed to submit onboarding data. Please try again.",
    );
  }

  if (!data?.data?.user) {
    throw new Error("Failed to submit onboarding data. Please try again.");
  }

  return data;
}
