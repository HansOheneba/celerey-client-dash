"use client";

import * as React from "react";

import { MiniStat } from "@/components/dashboard/assets/mini-stat";
import { AllocationDonut } from "@/components/dashboard/assets/allocation-donut";
import {
  CelereyInsights,
  type Insight,
} from "@/components/dashboard/assets/celerey-insights";
import {
  WealthDistribution,
  type LocationKey,
  type LocationOption,
  type LocationDistributionItem,
} from "@/components/dashboard/assets/wealth-distribution";
import {
  PropertyRow,
  type PropertyAsset,
} from "@/components/dashboard/assets/property-row";
import { PropertyAnalysis } from "@/components/dashboard/assets/property-analysis";
import { portfolioData } from "@/lib/client-data";

type AllocationItem = {
  key: "equities" | "fixed_income" | "alternatives" | "cash" | "crypto";
  label: string;
  value: number;
};

const LOCATIONS: LocationOption[] = [
  { key: "all", label: "All locations" },
  { key: "ghana_accra", label: "Accra, Ghana" },
  { key: "australia_sydney", label: "Sydney, Australia" },
  { key: "australia_melbourne", label: "Melbourne, Australia" },
  { key: "usa_newyork", label: "New York, USA" },
  { key: "uk_london", label: "London, UK" },
];

// Build allocations from client data
const buildAllocations = (): AllocationItem[] => [
  {
    key: "equities",
    label: "Equities",
    value: portfolioData.allocation.stocks.value,
  },
  {
    key: "fixed_income",
    label: "Fixed Income",
    value: portfolioData.allocation.bonds.value,
  },
  {
    key: "alternatives",
    label: "Alternatives",
    value: portfolioData.allocation.alternatives.value,
  },
  { key: "cash", label: "Cash", value: portfolioData.allocation.cash.value },
  { key: "crypto", label: "Crypto", value: 0 }, // Can be added to client-data if needed
];

const DEFAULT_ALLOCATIONS = buildAllocations();

const DEFAULT_INSIGHTS: Insight[] = [
  {
    id: "sector",
    title: "Sector Concentration",
    description: "Technology exposure at 35% exceeds recommended 25% limit.",
    tone: "warn",
  },
  {
    id: "rebalance",
    title: "Rebalancing Opportunity",
    description: "Shift ~5% from equities to fixed income to optimize risk.",
    tone: "good",
  },
];

// Build properties from client data
const buildProperties = (): PropertyAsset[] =>
  portfolioData.properties.map((prop) => ({
    id: prop.id,
    name: prop.name,
    location:
      prop.name === "Primary Residence"
        ? "Sydney, Australia"
        : "Melbourne, Australia",
    value: prop.value,
    loan: prop.mortgage,
    equity: prop.equity,
    lvr: Math.round((prop.mortgage / prop.value) * 100),
    monthlyRent: prop.name === "Rental Property" ? 2800 : undefined,
  }));

const DEFAULT_PROPERTIES = buildProperties();

const DEFAULT_LOCATION_DISTRIBUTION: LocationDistributionItem[] = [
  { locationKey: "ghana_accra", label: "Accra, Ghana", value: 320000 },
  {
    locationKey: "australia_sydney",
    label: "Sydney, Australia",
    value: 1150000,
  },
  {
    locationKey: "australia_melbourne",
    label: "Melbourne, Australia",
    value: 680000,
  },
  { locationKey: "usa_newyork", label: "New York, USA", value: 190000 },
  { locationKey: "uk_london", label: "London, UK", value: 120000 },
];

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

export default function PortfolioAndAssetsPage() {
  const [location, setLocation] = React.useState<LocationKey>("all");

  const allocations = React.useMemo(() => DEFAULT_ALLOCATIONS, []);

  const totalPortfolioValue = React.useMemo(() => {
    return sum(allocations.map((a) => a.value));
  }, [allocations]);

  // Demo numbers – replace with real computed metrics as needed
  const ytdPct = 8.7;
  const unrealizedGains = 444000;
  const riskLevel = "Moderate";

  const properties = React.useMemo(() => DEFAULT_PROPERTIES, []);
  const totalPropertyValue = React.useMemo(
    () => sum(properties.map((p) => p.value)),
    [properties],
  );
  const totalEquity = React.useMemo(
    () => sum(properties.map((p) => p.equity)),
    [properties],
  );
  const outstandingLoans = React.useMemo(
    () => sum(properties.map((p) => p.loan)),
    [properties],
  );

  const allocationDonutData = React.useMemo(
    () =>
      allocations.map((a) => ({
        label: a.label,
        value: a.value,
      })),
    [allocations],
  );

  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Portfolio & Major Assets
          </h1>
          <p className="text-sm text-muted-foreground">
            Consolidated view of investments, properties, and distribution
            insights.
          </p>
        </div>

        {/* Top stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MiniStat
            label="Total Portfolio Value"
            value={formatCurrency(totalPortfolioValue)}
            hint={`+${ytdPct.toFixed(1)}% YTD`}
          />
          <MiniStat
            label="Unrealized Gains"
            value={formatCurrency(unrealizedGains)}
            hint="Since inception"
          />
          <MiniStat
            label="Risk Level"
            value={riskLevel}
            hint="Aligned with profile"
          />
        </div>

        {/* Middle: allocation + Celerey insights */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <AllocationDonut
            title="Asset Allocation"
            data={allocationDonutData}
            centerLabel="Investments"
          />

          <CelereyInsights insights={DEFAULT_INSIGHTS} />
        </div>

        {/* Wealth by location */}
        <div className="mt-6">
          <WealthDistribution
            locations={LOCATIONS}
            distribution={DEFAULT_LOCATION_DISTRIBUTION}
            selectedLocation={location}
            onLocationChange={setLocation}
          />
        </div>

        {/* Property section */}
        <div className="mt-8 space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Property & Major Assets
            </h2>
            <p className="text-sm text-muted-foreground">
              Real estate holdings and property analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MiniStat
              label="Total Property Value"
              value={formatCurrency(totalPropertyValue)}
            />
            <MiniStat
              label="Total Equity"
              value={formatCurrency(totalEquity)}
            />
            <MiniStat
              label="Outstanding Loans"
              value={formatCurrency(outstandingLoans)}
            />
          </div>

          <div className="mt-2 space-y-4">
            {properties.map((p) => (
              <PropertyRow key={p.id} item={p} />
            ))}
          </div>

          <PropertyAnalysis />
        </div>
      </div>
    </div>
  );
}
