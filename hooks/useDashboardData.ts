// hooks/useDashboardData.ts
//
// Fetches the entire dashboard payload from a single endpoint
// (dashboard.summary) on mount and populates the financial store. Safe to
// call multiple times — deduped by a module-level flag so it only ever fires
// once per browser session regardless of remounts.

"use client";

import { useEffect } from "react";
import { useFinancialStore } from "@/store/financialStore";
import {
  fetchDashboardSummary,
  consumeDashboardSummaryPrefetch,
  type DashboardSummaryData,
} from "@/lib/dashboard-api";
import {
  setSubscriptionData,
  getAuth,
  getSubscription,
  mockStartTrialIfMissing,
} from "@/lib/client-data";
import { markPageKeysFetched } from "@/hooks/usePageData";

// Module-level — survives component remounts (e.g. React StrictMode double-fire,
// layout re-renders). Resets only on a hard page reload.
let _bootstrapped = false;

export function useDashboardData() {
  const hydrateFromApi = useFinancialStore((s) => s.hydrateFromApi);
  const setUser = useFinancialStore((s) => s.setUser);

  useEffect(() => {
    if (_bootstrapped) return;
    // Skip all API calls if there's no valid session — DashboardGuard will redirect.
    if (!getAuth().loggedIn) return;
    _bootstrapped = true;

    // Reuse the in-flight prefetch from OTP verify if present; otherwise start
    // a fresh fetch. Either way, one round-trip to dashboard.summary.
    const summaryPromise: Promise<DashboardSummaryData> =
      consumeDashboardSummaryPrefetch() ?? fetchDashboardSummary();

    summaryPromise
      .then((summary) => {
        // 1. User profile → sidebar / topbar / etc.
        if (summary.user) {
          const user = summary.user;
          setUser({
            user_id: user.user_id,
            email: user.email ?? "",
            first_name: user.first_name ?? undefined,
            last_name: user.last_name ?? undefined,
            display_name: user.display_name,
            phone_number: user.phone_number,
            resident_country: user.resident_country ?? "",
            city: user.city,
            citizenships: user.citizenships ?? [],
            date_of_birth: user.date_of_birth ?? undefined,
            currency: user.currency ?? "USD",
            preferred_contact: user.preferred_contact ?? undefined,
            occupation: user.occupation ?? undefined,
            marital_status: user.marital_status as any,
            account_mode: user.account_mode as any,
            risk_profile: user.risk_profile as any,
            dependents: user.dependents ?? undefined,
            bio: user.bio ?? undefined,
            is_active: user.is_active ?? true,
            user_type: user.user_type as any,
            created_at: user.created_at ?? "",
            updated_at: user.updated_at ?? "",
          });
        }

        // 2. Subscription → localStorage / useClientGate. Skip during Stripe
        // return — that flow owns subscription writes via its poll loop.
        // MOCK: while backend webhook is unreliable, we DO NOT trust the
        // backend `subscription_status` and instead default new users to a
        // local 7-day trial. The upgrade button flips this to "active/pro"
        // locally. Remove this block once the backend is ready and switch
        // back to `setSubscriptionData(summary.subscription)`.
        const isStripeReturn =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("sub") === "success";
        if (!isStripeReturn) {
          // Only sync the backend payload if it reports an actual paid/active
          // state. Otherwise fall back to the local mock trial.
          const backendStatus = summary.subscription?.subscription_status;
          if (
            summary.subscription &&
            (backendStatus === "active" || backendStatus === "trialing")
          ) {
            setSubscriptionData(summary.subscription);
          } else if (getSubscription().status === "none") {
            mockStartTrialIfMissing();
          }
        }

        // 3. Financial data → Zustand store.
        hydrateFromApi(summary);

        // 4. Tell usePageData every overview-covered key is fresh so tab
        // navigation within the TTL window doesn't refetch the same data.
        markPageKeysFetched(
          "overview",
          "goals",
          "cash-flow",
          "assets",
          "insurance",
          "properties",
          "retirement",
          "profile",
        );
      })
      .catch((err) => {
        // Non-fatal — keep whatever was in localStorage. The user still sees
        // their persisted seeded data.
        console.warn("[useDashboardData] dashboard.summary failed:", err);
      });
  }, [hydrateFromApi, setUser]);
}
