"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MiniStat } from "@/components/dashboard/assets/mini-stat";
import { PropertyRow } from "@/components/dashboard/assets/property-row";
import { PropertyAnalysis } from "@/components/dashboard/assets/property-analysis";
import {
  mockProperties,
  propertyEquity,
  propertyLvr,
} from "@/lib/property-data";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function PropertiesTab() {
  const properties = mockProperties.filter((p) => p.is_active);

  const totalPropertyValue = React.useMemo(
    () => sum(properties.map((p) => p.market_value)),
    [properties],
  );
  const totalEquity = React.useMemo(
    () => sum(properties.map((p) => propertyEquity(p))),
    [properties],
  );
  const outstandingLoans = React.useMemo(
    () => sum(properties.map((p) => p.mortgage_balance)),
    [properties],
  );
  const avgLvr = React.useMemo(() => {
    if (!properties.length) return 0;
    const totalLvr = properties.reduce((s, p) => s + propertyLvr(p), 0);
    return Math.round(totalLvr / properties.length);
  }, [properties]);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat
          label="Total Property Value"
          value={formatCurrency(totalPropertyValue)}
        />
        <MiniStat label="Total Equity" value={formatCurrency(totalEquity)} />
        <MiniStat
          label="Outstanding Loans"
          value={formatCurrency(outstandingLoans)}
        />
        <MiniStat
          label="Avg LVR"
          value={`${avgLvr}%`}
          hint={avgLvr > 60 ? "Consider reducing leverage" : "Healthy range"}
        />
      </div>

      {/* Property list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Your Properties
            </h2>
            <p className="text-sm text-muted-foreground">
              Detailed breakdown of each real estate holding.
            </p>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/properties/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>

        {properties.map((p) => (
          <PropertyRow key={p.property_id} property={p} />
        ))}
      </div>

      {/* Analysis */}
      <PropertyAnalysis />
    </>
  );
}
