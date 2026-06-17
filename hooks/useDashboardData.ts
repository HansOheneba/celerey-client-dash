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
  fetchLatestRiskAssessment,
  type DashboardSummaryData,
  SessionExpiredError,
} from "@/lib/dashboard-api";
import {
  setSubscriptionData,
  getAuth,
  getSubscription,
  mockStartTrialIfMissing,
} from "@/lib/client-data";
import { markPageKeysFetched } from "@/hooks/usePageData";
import { mergeUserWithRiskAssessment } from "@/lib/map-api-user";
import { isDemoMode } from "@/lib/demo-mode";

// Module-level — survives component remounts (e.g. React StrictMode double-fire,
// layout re-renders). Resets only on a hard page reload.
let _bootstrapped = false;

export function useDashboardData() {
  const hydrateFromApi = useFinancialStore((s) => s.hydrateFromApi);
  const setUser = useFinancialStore((s) => s.setUser);
  const setRiskAssessment = useFinancialStore((s) => s.setRiskAssessment);

  useEffect(() => {
    if (_bootstrapped) return;
    if (isDemoMode()) return;
    // Skip all API calls if there's no valid session — DashboardGuard will redirect.
    if (!getAuth().loggedIn) return;
    _bootstrapped = true;

    // Reuse the in-flight prefetch from OTP verify if present; otherwise start
    // a fresh fetch. Either way, one round-trip to dashboard.summary.
    const summaryPromise: Promise<DashboardSummaryData | null> =
      consumeDashboardSummaryPrefetch() ?? fetchDashboardSummary();

    summaryPromise
      .then(async (summary) => {
        if (!summary) return;

        let riskAssessment = summary.riskAssessment;
        if (!riskAssessment) {
          riskAssessment = await fetchLatestRiskAssessment();
        }

        if (summary.user) {
          setUser(mergeUserWithRiskAssessment(summary.user, riskAssessment));
        }
        if (riskAssessment) {
          setRiskAssessment(riskAssessment);
        }

        hydrateFromApi({ ...summary, riskAssessment });

        // Subscription → localStorage / useClientGate. Skip during Stripe
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

        // Tell usePageData every overview-covered key is fresh so tab
        // navigation within the TTL window doesn't refetch the same data.
        markPageKeysFetched(
          "overview",
          "goals",
          "cash-flow",
          "assets",
          "insurance",
          "properties",
          "liabilities",
          "retirement",
          "profile",
        );
      })
      .catch((err) => {
        if (err instanceof SessionExpiredError) return;
        // Non-fatal — keep whatever was in localStorage. The user still sees
        // their persisted seeded data.
        console.warn("[useDashboardData] dashboard.summary failed:", err);
      });
  }, [hydrateFromApi, setUser, setRiskAssessment]);
}
