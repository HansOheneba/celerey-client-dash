// components/dashboard/kpi-strip.tsx
//
// Reusable KPI row used on every dashboard tab.
//
// Visual style (background, border, radius) is driven by the central
// theme module: lib/dashboard-theme.ts → dashboardTheme.kpiTile. Edit
// that token to restyle every KPI tile across the app.

import * as React from "react";
import { cn } from "@/lib/client-data";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";

export type KpiItem = {
  label: string;
  value: string;
  subline?: string;
  tone?: "good" | "warning" | "danger" | "neutral";
  icon?: React.ReactNode;
  onClick?: () => void;
};

interface KpiStripProps {
  items: KpiItem[];
  cols?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  /** When true, shows the static label but replaces value/subline with skeletons */
  loading?: boolean;
}

const toneClass: Record<NonNullable<KpiItem["tone"]>, string> = {
  good: "blue-950",
  warning: "text-amber-700",
  danger: "text-red-500",
  neutral: "text-foreground",
};

const colsClass: Record<NonNullable<KpiStripProps["cols"]>, string> = {
  // Container-query driven so the strip reacts to the dashboard `<main>`
  // width - not the viewport. This keeps cards from squishing when side
  // panels (e.g. profile setup) narrow the content column.
  2: "grid-cols-1 @sm/dash:grid-cols-2",
  3: "grid-cols-1 @sm/dash:grid-cols-2 @2xl/dash:grid-cols-3",
  4: "grid-cols-1 @sm/dash:grid-cols-2 @3xl/dash:grid-cols-4",
  5: "grid-cols-1 @sm/dash:grid-cols-2 @2xl/dash:grid-cols-3 @4xl/dash:grid-cols-5",
  6: "grid-cols-1 @sm/dash:grid-cols-2 @2xl/dash:grid-cols-3 @4xl/dash:grid-cols-6",
};

export function KpiStrip({
  items,
  cols = 6,
  className,
  loading,
}: KpiStripProps) {
  return (
    <div className={cn(`grid gap-3 ${colsClass[cols]}`, className)}>
      {items.map((item) => (
        <div
          key={item.label}
          onClick={loading ? undefined : item.onClick}
          className={cn(
            dashboardTheme.kpiTile,
            "px-4 py-3.5 space-y-1",
            !loading && item.onClick && "cursor-pointer transition-shadow",
          )}
        >
          {item.icon && (
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-muted/60">{item.icon}</div>
            </div>
          )}
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          {loading ? (
            <>
              <Skeleton className="h-6 w-24 mt-1" />
              <Skeleton className="h-3 w-32 mt-1" />
            </>
          ) : (
            <>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums tracking-tight",
                  item.tone ? toneClass[item.tone] : "text-foreground",
                )}
              >
                {item.value}
              </p>
              {item.subline && (
                <p className="text-[11px] text-muted-foreground">
                  {item.subline}
                </p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
