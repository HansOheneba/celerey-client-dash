// hooks/usePageData.ts
//
// Lightweight hook that each dashboard page calls on mount to fetch its own
// data slice and hydrate the store. Falls back gracefully on error.

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
} from "@/lib/dashboard-api";

export type PageDataKey =
  | "goals"
  | "cash-flow"
  | "assets"
  | "insurance"
  | "properties"
  | "profile"
  | "overview"; // fetches goals + cashflow summary

/**
 * Call this hook at the top of each dashboard page.
 * It refetches the relevant data slice every time the page mounts
 * and writes the result into the financial store.
 *
 * Returns `{ loading }` so the page can show a skeleton while data loads.
 */
export function usePageData(key: PageDataKey) {
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    // Prevent double-fire in React StrictMode
    if (mounted.current) return;
    mounted.current = true;

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
                first_name: user.first_name,
                last_name: user.last_name,
                display_name: user.display_name,
                phone_number: user.phone_number,
                resident_country: user.resident_country ?? "",
                city: user.city,
                citizenships: user.citizenships ?? [],
                date_of_birth: user.date_of_birth,
                currency: user.currency ?? "USD",
                preferred_contact: user.preferred_contact,
                occupation: user.occupation,
                marital_status: user.marital_status as any,
                account_mode: user.account_mode as any,
                risk_profile: user.risk_profile as any,
                dependents: user.dependents,
                bio: user.bio,
                is_active: user.is_active ?? true,
                user_type: user.user_type as any,
                created_at: user.created_at ?? "",
                updated_at: user.updated_at ?? "",
              });
            }
            break;
          }
          case "overview": {
            const [goals, income, expenses, history] = await Promise.allSettled(
              [
                fetchGoals(),
                fetchIncome(),
                fetchExpenses(),
                fetchCashFlowHistory(),
              ],
            );
            if (goals.status === "fulfilled") store.setGoals(goals.value);
            if (income.status === "fulfilled") store.setIncome(income.value);
            if (expenses.status === "fulfilled")
              store.setExpenses(expenses.value);
            if (history.status === "fulfilled")
              store.setCashFlowHistory(history.value);
            break;
          }
        }
      } catch (err) {
        console.error(`[usePageData] error fetching "${key}":`, err);
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { loading };
}
