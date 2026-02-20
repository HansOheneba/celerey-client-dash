"use client";

import { InsuranceTab } from "@/components/dashboard/insurance/insurance-tab";

export default function InsurancePage() {
  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Insurance</h1>
          <p className="text-sm text-muted-foreground">
            All your insurance policies in one place — life, health, auto,
            property, and more.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <InsuranceTab />
        </div>
      </div>
    </div>
  );
}
