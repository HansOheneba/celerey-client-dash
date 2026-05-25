// lib/onboarding/api.ts
import type { OnboardingPayload } from "./types";
import type { UserProfile } from "@/lib/client-data";

/**
 * Thrown when the onboarding session token cookie is missing or expired
 * (server responds 401). Callers can catch this to trigger a re-verify flow.
 */
export class TokenExpiredError extends Error {
  constructor(message = "Onboarding session expired. Please log in again.") {
    super(message);
    this.name = "TokenExpiredError";
  }
}

export interface SubmitOnboardingResult {
  success: boolean;
  data: {
    user: UserProfile;
    session_token?: string;
    [key: string]: unknown;
  };
}

/**
 * Submits the full onboarding payload to the backend via the secure
 * server-side route, which attaches the HttpOnly onboarding_token cookie
 * as a Bearer token header so JS never has to read it.
 */
export async function submitOnboarding(
  payload: OnboardingPayload,
): Promise<SubmitOnboardingResult> {
  const body = {
    ...payload,
    incomes: payload.incomes.map(
      ({ name, amount_monthly, category, is_recurring }) => ({
        name,
        amount_monthly,
        category,
        is_recurring,
      }),
    ),
  };

  const response = await fetch("/api/onboarding/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as
    | (Partial<SubmitOnboardingResult> & {
        message?: string;
        error?: string;
      })
    | null;

  if (response.status === 401) {
    throw new TokenExpiredError(data?.message ?? data?.error ?? undefined);
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ??
        data?.error ??
        "Failed to submit onboarding data. Please try again.",
    );
  }

  if (!data?.data?.user) {
    throw new Error(
      "Onboarding succeeded but the server response was malformed. Please refresh and try again.",
    );
  }

  return data as SubmitOnboardingResult;
}
