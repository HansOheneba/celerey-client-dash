"use client";

import { PropertiesTab } from "@/components/dashboard/assets/properties-tab";

export default function PropertiesPage() {
  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
          <p className="text-sm text-muted-foreground">
            Real estate holdings, equity breakdown, and property analysis.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <PropertiesTab />
        </div>
      </div>
    </div>
  );
}
