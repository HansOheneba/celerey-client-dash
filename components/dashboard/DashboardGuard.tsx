"use client";

// components/dashboard/DashboardGuard.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isOnboarded, getSubscription, getAuth } from "@/lib/client-data";

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
    const sub = getSubscription();
    if (sub.status === "none") {
      router.replace("/choose-plan");
    }
  }, [router]);

  return <>{children}</>;
}
