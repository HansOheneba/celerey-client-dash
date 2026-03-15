// components/dashboard/kpi-strip.tsx

import * as React from "react";
import { cn } from "@/lib/client-data";

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
}

const toneClass: Record<NonNullable<KpiItem["tone"]>, string> = {
  good: "text-emerald-600",
  warning: "text-amber-500",
  danger: "text-red-500",
  neutral: "text-foreground",
};

const colsClass: Record<NonNullable<KpiStripProps["cols"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

export function KpiStrip({ items, cols = 6, className }: KpiStripProps) {
  return (
    <div className={cn(`grid gap-3 ${colsClass[cols]}`, className)}>
      {items.map((item) => (
        <div
          key={item.label}
          onClick={item.onClick}
          className={cn(
            "rounded-xl border bg-card px-4 py-3.5 space-y-1",
            item.onClick && "cursor-pointer transition-shadow",
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
          <p
            className={cn(
              "text-lg font-bold tabular-nums tracking-tight",
              item.tone ? toneClass[item.tone] : "text-foreground",
            )}
          >
            {item.value}
          </p>
          {item.subline && (
            <p className="text-[11px] text-muted-foreground">{item.subline}</p>
          )}
        </div>
      ))}
    </div>
  );
}
