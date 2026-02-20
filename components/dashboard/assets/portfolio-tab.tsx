"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MiniStat } from "@/components/dashboard/assets/mini-stat";
import { AllocationDonut } from "@/components/dashboard/assets/allocation-donut";
import { CelereyInsights } from "@/components/dashboard/assets/celerey-insights";
import { WealthDistribution } from "@/components/dashboard/assets/wealth-distribution";
import { HoldingRow } from "@/components/dashboard/assets/holding-row";
import {
  DEFAULT_INSIGHTS,
  DEFAULT_LOCATION_DISTRIBUTION,
  LOCATIONS,
  formatCurrency,
  sum,
  type LocationKey,
} from "@/components/dashboard/assets/data";
import {
  mockHoldings,
  mockValuations,
  currentValue,
  assetTypeLabel,
} from "@/lib/asset-data";

export function PortfolioTab() {
  const [location, setLocation] = React.useState<LocationKey>("all");

  const holdings = mockHoldings.filter((h) => h.is_active);
  const valuations = mockValuations;

  // Compute totals from holdings
  const totalPortfolioValue = React.useMemo(
    () => sum(holdings.map((h) => currentValue(h, valuations))),
    [holdings, valuations],
  );
  const totalCostBasis = React.useMemo(
    () => sum(holdings.map((h) => h.initial_value)),
    [holdings],
  );
  const totalGainLoss = totalPortfolioValue - totalCostBasis;
  const totalReturnPct =
    totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Build allocation donut from holdings grouped by asset_type
  const allocationDonutData = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const h of holdings) {
      const label = assetTypeLabel(h.asset_type);
      map.set(label, (map.get(label) ?? 0) + currentValue(h, valuations));
    }
    return Array.from(map, ([label, value]) => ({ label, value }));
  }, [holdings, valuations]);

  return (
    <>
      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MiniStat
          label="Total Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
        />
        <MiniStat label="Cost Basis" value={formatCurrency(totalCostBasis)} />
        <MiniStat
          label="Total Gain / Loss"
          value={`${totalGainLoss >= 0 ? "+" : ""}${formatCurrency(totalGainLoss)}`}
          hint={`${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(1)}%`}
        />
        <MiniStat
          label="Holdings"
          value={String(holdings.length)}
          hint="Active positions"
        />
      </div>

      {/* Allocation + insights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AllocationDonut
          title="Asset Allocation"
          data={allocationDonutData}
          centerLabel="Investments"
        />
        <CelereyInsights insights={DEFAULT_INSIGHTS} />
      </div>

      {/* Holdings list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Holdings</h2>
            <p className="text-sm text-muted-foreground">
              All active investment positions.
            </p>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/assets/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Holding
            </Link>
          </Button>
        </div>

        {holdings.map((h) => (
          <HoldingRow key={h.holding_id} holding={h} valuations={valuations} />
        ))}
      </div>

      {/* Wealth distribution */}
      <WealthDistribution
        locations={LOCATIONS}
        distribution={DEFAULT_LOCATION_DISTRIBUTION}
        selectedLocation={location}
        onLocationChange={setLocation}
      />
    </>
  );
}
