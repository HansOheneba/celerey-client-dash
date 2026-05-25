"use client";

// components/dashboard/DashboardGuard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isOnboarded,
  getAuth,
  getSubscription,
  setSubscriptionData,
} from "@/lib/client-data";
import { fetchSubscription } from "@/lib/dashboard-api";
import { CelereyLoader } from "@/components/login/celerey-loader";

type GuardState = "checking" | "allowed" | "redirecting";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    const auth = getAuth();
    if (!auth.loggedIn) {
      router.replace("/");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding");
      return;
    }

    // Stripe success redirect - dashboard/page.tsx owns the polling for this case.
    // Let it through so the "Confirming your subscription..." overlay can run.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sub") === "success") {
        setState("allowed");
        return;
      }
    }

    // Verify subscription status with the backend.
    // Race against an 8-second timeout so a slow backend never leaves the
    // user staring at the loader indefinitely.
    const timeoutId = { current: 0 };
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutId.current = window.setTimeout(() => resolve(null), 8_000);
    });

    Promise.race([fetchSubscription(), timeoutPromise]).then((data) => {
      clearTimeout(timeoutId.current);

      if (data === null) {
        // API error or timeout - fall back to cached subscription to avoid
        // falsely locking out users with a known valid subscription
        const local = getSubscription();
        if (local.status === "trialing" || local.status === "active") {
          setState("allowed");
        } else {
          router.replace("/choose-plan");
          setState("redirecting");
        }
        return;
      }

      const status = data.subscription_status;
      if (status === "trialing" || status === "active") {
        setSubscriptionData(data);
        setState("allowed");
      } else {
        router.replace("/choose-plan");
        setState("redirecting");
      }
    });
  }, [router]);

  if (state === "checking") return <CelereyLoader />;
  if (state !== "allowed") return null;
  return <>{children}</>;
}
