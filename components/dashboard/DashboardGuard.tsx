"use client";

// components/dashboard/DashboardGuard.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isOnboarded, getAuth } from "@/lib/client-data";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
    // Subscription paywall is temporarily disabled while the backend
    // subscription_status sync is being fixed. Feature-level entitlements
    // (canAccessFeature) still gate premium UI elements.
  }, [router]);

  return <>{children}</>;
}
