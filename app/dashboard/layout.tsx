"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/dashboard/sidebar";
import DashboardTopbar from "@/components/dashboard/topbar";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { CelereyLoader } from "@/components/login/celerey-loader";
import { useFinancialStore } from "@/store/financialStore";
import { setDefaultCurrency } from "@/lib/client-data";
import { SessionExpiredError } from "@/lib/dashboard-api";
import { SESSION_EXPIRED_EVENT } from "@/lib/session-expired";
import { resetSession } from "@/lib/session-reset";
import { ProfilePanelProvider } from "@/components/dashboard/ProfilePanelContext";
import { ProfileSetupPanel } from "@/components/dashboard/profile-setup-panel";
import { ProfileWelcomeDialog } from "@/components/dashboard/ProfileWelcomeDialog";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import { RiskQuizDialog } from "@/components/dashboard/risk/quizCard";
import { useProfilePanel } from "@/components/dashboard/ProfilePanelContext";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { useDashboardData } from "@/hooks/useDashboardData";
import { AskCelereyAIButton } from "@/components/dashboard/ask-celerey-ai-button";

/** Triggers zustand-persist rehydration from localStorage after mount. */
function StoreHydrator() {
  useEffect(() => {
    useFinancialStore.persist.rehydrate();
  }, []);
  return null;
}

/** Keeps the formatCurrency default in sync with the user's chosen currency. */
function CurrencySync() {
  const currency = useFinancialStore((s) => s.user?.currency);
  useEffect(() => {
    setDefaultCurrency(currency ?? "USD");
  }, [currency]);
  return null;
}

/**
 * Shows a modal when the session expires (401 after refresh fails) and
 * redirects the user to sign in again.
 */
function SessionExpiredBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);

  const goToSignIn = React.useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {
      /* noop */
    }
    resetSession();
    router.replace("/");
  }, [router]);

  useEffect(() => {
    function show() {
      setVisible(true);
    }
    function handleRejection(event: PromiseRejectionEvent) {
      if (event.reason instanceof SessionExpiredError) {
        event.preventDefault();
        show();
      }
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, show);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, show);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (countdown <= 0) {
      void goToSignIn();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, countdown, goToSignIn]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-semibold text-gray-900">Session expired</h2>
        <p className="text-sm text-gray-500">
          For your security, you have been signed out. Please sign in again to
          continue. Redirecting in{" "}
          <span className="font-semibold text-gray-800">{countdown}</span>{" "}
          second{countdown !== 1 ? "s" : ""}.
        </p>
        <button
          type="button"
          onClick={() => void goToSignIn()}
          className="w-full rounded-lg bg-[#151339] py-2.5 text-sm font-medium text-white hover:bg-[#1e1c4e] transition-colors"
        >
          Sign in again
        </button>
      </div>
    </div>
  );
}

/** Loads dashboard.summary once so user + data are ready for the tour and shell. */
function DashboardBootstrap() {
  useDashboardData();
  return null;
}

/** Renders the global risk quiz dialog, available on every dashboard page. */
function GlobalRiskQuizDialog() {
  const { riskQuizOpen, closeRiskQuiz } = useProfilePanel();
  return <RiskQuizDialog open={riskQuizOpen} onClose={closeRiskQuiz} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <>
      {/* Global dashboard loader */}
      {!loadingDone && (
        <CelereyLoader onDone={() => setLoadingDone(true)} duration={1600} />
      )}

      <SessionExpiredBanner />

      {/* Main layout */}
      <div
        style={{
          visibility: loadingDone ? "visible" : "hidden",
        }}
      >
        <StoreHydrator />
        <CurrencySync />
        <DashboardGuard>
          <ProfilePanelProvider>
            <DashboardBootstrap />
            <GlobalRiskQuizDialog />
            <ProfileWelcomeDialog />
            <SidebarProvider defaultOpen>
              <div className="flex min-h-svh w-full overflow-x-hidden">
                <AdminSidebar />
                <DashboardTour layoutReady={loadingDone} />

                <SidebarInset className="min-w-0 flex flex-col h-svh overflow-hidden">
                  <DashboardTopbar />

                  <main
                    className={`flex-1 overflow-y-auto p-6 ${dashboardTheme.surface}`}
                  >
                    {children}
                  </main>
                </SidebarInset>

                <ProfileSetupPanel />
              </div>
            </SidebarProvider>
            <AskCelereyAIButton />
          </ProfilePanelProvider>
        </DashboardGuard>
      </div>
    </>
  );
}
