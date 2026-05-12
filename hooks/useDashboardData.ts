// hooks/useDashboardData.ts
//
// Fetches all live dashboard data from the API on mount and populates
// the financial store. Safe to call multiple times — deduped by a flag.

"use client";

import { useEffect, useRef } from "react";
import { useFinancialStore } from "@/store/financialStore";
import {
  fetchDashboardBootstrap,
  fetchUser,
  fetchSubscription,
} from "@/lib/dashboard-api";
import { setSubscriptionData, getAuth } from "@/lib/client-data";

export function useDashboardData() {
  const hydrated = useRef(false);
  const hydrateFromApi = useFinancialStore((s) => s.hydrateFromApi);
  const setUser = useFinancialStore((s) => s.setUser);

  useEffect(() => {
    if (hydrated.current) return;
    // Skip all API calls if there's no valid session — DashboardGuard will redirect.
    if (!getAuth().loggedIn) return;
    hydrated.current = true;

    // Fetch user profile first so the sidebar email is always populated
    fetchUser()
      .then((user) => {
        if (user) {
          console.log("[useDashboardData] user.get ◄", user);
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
      })
      .catch(() => {
        // Non-fatal — keep whatever is in the store from localStorage
      });

    fetchDashboardBootstrap()
      .then((data) => {
        hydrateFromApi(data);
      })
      .catch(() => {
        // Non-fatal — store keeps whatever was in localStorage.
        // Silent: the user still sees their seeded onboarding data.
      });

    // Sync server-authoritative subscription state into localStorage so
    // useClientGate / canAccessFeature always reflect the real entitlement.
    fetchSubscription()
      .then((sub) => {
        if (sub?.subscription_status) {
          setSubscriptionData(sub);
        }
      })
      .catch(() => {
        // Non-fatal — keep whatever is in localStorage
      });
  }, [hydrateFromApi, setUser]);
}
