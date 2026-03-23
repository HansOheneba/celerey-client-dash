"use client";

import React, { useState, useEffect } from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/dashboard/sidebar";
import DashboardTopbar from "@/components/dashboard/topbar";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { CelereyLoader } from "@/components/login/celerey-loader";
import { useFinancialStore } from "@/store/financialStore";
import { setDefaultCurrency } from "@/lib/client-data";

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

      {/* Main layout */}
      <div
        style={{
          visibility: loadingDone ? "visible" : "hidden",
        }}
      >
        <StoreHydrator />
        <CurrencySync />
        <DashboardGuard>
          <SidebarProvider defaultOpen>
            <div className="flex min-h-svh w-full overflow-x-hidden">
              <AdminSidebar />

              <SidebarInset className="min-w-0 flex flex-col h-svh overflow-hidden">
                <DashboardTopbar />

                <main className="flex-1 overflow-y-auto bg-blue-50/20 p-6">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </DashboardGuard>
      </div>
    </>
  );
}
