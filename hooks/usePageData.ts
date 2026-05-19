// hooks/usePageData.ts
//
// Lightweight hook that each dashboard page calls on mount to fetch its own
// data slice and hydrate the store. Falls back gracefully on error.
//
// Uses a module-level TTL cache so navigating quickly between pages doesn't
// spam the API — each key can only re-fetch after CACHE_TTL_MS.

"use client";

import { useEffect, useRef, useState } from "react";
import { useFinancialStore } from "@/store/financialStore";
import {
  fetchGoals,
  fetchIncome,
  fetchExpenses,
  fetchEmergencyFund,
  fetchCashFlowHistory,
  fetchAssets,
  fetchInsurancePolicies,
  fetchProperties,
  fetchUser,
  fetchRetirement,
  fetchDashboardSummary,
} from "@/lib/dashboard-api";

export type PageDataKey =
  | "goals"
  | "cash-flow"
  | "assets"
  | "insurance"
  | "properties"
  | "profile"
  | "retirement"
  | "overview"; // fetches goals + cashflow summary

// Module-level cache: key → timestamp of last successful fetch
// Prevents re-fetching the same data within CACHE_TTL_MS milliseconds.
const _lastFetched = new Map<PageDataKey, number>();
const CACHE_TTL_MS = 30_000;

/**
 * Called by useDashboardData after bootstrap completes so usePageData
 * doesn't double-fetch the same endpoints that bootstrap already covered.
 */
export function markPageKeysFetched(...keys: PageDataKey[]) {
  const now = Date.now();
  for (const key of keys) _lastFetched.set(key, now);
}

/**
 * Call this hook at the top of each dashboard page.
 * It refetches the relevant data slice on mount, but skips the fetch if the
 * same key was already fetched within the last 30 seconds.
 *
 * Returns `{ loading }` so the page can show a skeleton while data loads.
 */
export function usePageData(key: PageDataKey) {
  // Initialize synchronously from the TTL cache so re-visits never flash a
  // skeleton. If the key was fetched recently, loading starts as false and
  // no skeleton renders at all. First-ever visit still starts as true.
  const [loading, setLoading] = useState(
    () => Date.now() - (_lastFetched.get(key) ?? 0) >= CACHE_TTL_MS,
  );
  const mounted = useRef(false);

  useEffect(() => {
    // Prevent double-fire in React StrictMode
    if (mounted.current) return;
    mounted.current = true;

    // Skip if this key was already fetched recently
    const lastFetch = _lastFetched.get(key) ?? 0;
    if (Date.now() - lastFetch < CACHE_TTL_MS) {
      // loading is already false from the lazy init above
      return;
    }

    setLoading(true);
    const store = useFinancialStore.getState();

    const run = async () => {
      try {
        switch (key) {
          case "goals": {
            console.log("[usePageData] fetching goals...");
            const goals = await fetchGoals();
            console.log("[usePageData] goals result:", goals);
            store.setGoals(goals);
            break;
          }
          case "cash-flow": {
            const [income, expenses, emergencyFund, history] =
              await Promise.allSettled([
                fetchIncome(),
                fetchExpenses(),
                fetchEmergencyFund(),
                fetchCashFlowHistory(),
              ]);
            if (income.status === "fulfilled") store.setIncome(income.value);
            if (expenses.status === "fulfilled")
              store.setExpenses(expenses.value);
            if (emergencyFund.status === "fulfilled" && emergencyFund.value) {
              store.setEmergencyFund({
                currentCashBalance: emergencyFund.value.cash_balance,
                targetMonths: emergencyFund.value.target_months ?? 6,
                includeAccountIds: [],
                updatedAt: new Date().toISOString(),
              });
            }
            if (history.status === "fulfilled")
              store.setCashFlowHistory(history.value);
            break;
          }
          case "assets": {
            const holdings = await fetchAssets();
            store.setHoldings(holdings);
            break;
          }
          case "insurance": {
            const policies = await fetchInsurancePolicies();
            store.setInsurancePolicies(policies);
            break;
          }
          case "properties": {
            const props = await fetchProperties();
            store.setPropertyAssets(props);
            break;
          }
          case "profile": {
            console.log("[usePageData] fetching user profile...");
            const user = await fetchUser();
            console.log("[usePageData] user.get ◄", user);
            if (user) {
              store.setUser({
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
            break;
          }
          case "retirement": {
            console.log("[usePageData] fetching retirement...");
            const retirement = await fetchRetirement();
            console.log("[usePageData] retirement result:", retirement);
            if (retirement) store.setRetirement(retirement);
            break;
          }
          case "overview": {
            // Single consolidated endpoint that returns goals, cashflow,
            // assets, properties, insurance, retirement, etc. in one call.
            // Avoids hitting the per-resource rate limit.
            const summary = await fetchDashboardSummary();
            store.hydrateFromApi(summary);
            // Mark every key the summary already covers as fresh so a quick
            // tab switch doesn't trigger a duplicate per-resource fetch.
            markPageKeysFetched(
              "goals",
              "cash-flow",
              "assets",
              "insurance",
              "properties",
              "retirement",
              "profile",
            );
            break;
          }
        }
      } catch (err) {
        console.error(`[usePageData] error fetching "${key}":`, err);
      } finally {
        _lastFetched.set(key, Date.now());
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { loading };
}
