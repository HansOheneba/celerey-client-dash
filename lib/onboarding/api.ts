// lib/onboarding/api.ts
import type { OnboardingPayload } from "./types";

/**
 * Submits the full onboarding payload.
 * No real API yet — data is persisted in Zustand and printed to the console.
 */
export async function submitOnboarding(
  payload: OnboardingPayload,
): Promise<void> {
  console.log(
    "%c[Celerey Onboarding] ✅ Submission triggered",
    "color: #151339; font-weight: bold; font-size: 14px; background: #f0f0ff; padding: 2px 8px; border-radius: 4px;",
  );
  console.log(
    "%c[Celerey Onboarding] Full payload:",
    "color: #4f46e5; font-weight: 600;",
  );
  console.log(JSON.stringify(payload, null, 2));

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 900));

  console.log(
    "%c[Celerey Onboarding] 🎉 Persisted (mock — no API yet)",
    "color: #16a34a; font-weight: bold; font-size: 13px;",
  );
}
