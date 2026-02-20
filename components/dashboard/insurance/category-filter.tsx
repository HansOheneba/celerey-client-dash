"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import {
  type GeneralInsuranceCategory,
  GENERAL_INSURANCE_CATEGORIES,
} from "@/lib/insurance-data";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type FilterValue = "all" | GeneralInsuranceCategory;

export function CategoryFilter({
  value,
  onChange,
  counts,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  counts: Record<string, number>;
}) {
  const items: { key: FilterValue; label: string }[] = [
    { key: "all", label: "All" },
    ...GENERAL_INSURANCE_CATEGORIES.filter(
      (c) => (counts[c.value] ?? 0) > 0,
    ).map((c) => ({
      key: c.value as FilterValue,
      label: c.label.replace(" Insurance", ""),
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => {
        const active = value === t.key;
        const count = t.key === "all" ? undefined : counts[t.key];
        return (
          <Button
            key={t.key}
            type="button"
            variant={active ? "default" : "secondary"}
            size="sm"
            className={cn(
              "rounded-full",
              active ? "" : "bg-muted/60 text-foreground hover:bg-muted",
            )}
            onClick={() => onChange(t.key)}
          >
            {t.label}
            {count !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
