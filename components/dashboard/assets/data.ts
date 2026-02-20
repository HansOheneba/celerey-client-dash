import type { Insight } from "@/components/dashboard/assets/celerey-insights";
import type {
  LocationKey,
  LocationOption,
  LocationDistributionItem,
} from "@/components/dashboard/assets/wealth-distribution";
import { portfolioData } from "@/lib/client-data";

// ── Shared types ────────────────────────────────────────────────
export type AllocationItem = {
  key: "equities" | "fixed_income" | "alternatives" | "cash" | "crypto";
  label: string;
  value: number;
};

export type AssetsTab = "portfolio" | "properties";

// ── Helpers ─────────────────────────────────────────────────────
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// ── Static data ─────────────────────────────────────────────────
export const LOCATIONS: LocationOption[] = [
  { key: "all", label: "All locations" },
  { key: "ghana_accra", label: "Accra, Ghana" },
  { key: "australia_sydney", label: "Sydney, Australia" },
  { key: "australia_melbourne", label: "Melbourne, Australia" },
  { key: "usa_newyork", label: "New York, USA" },
  { key: "uk_london", label: "London, UK" },
];

export const DEFAULT_ALLOCATIONS: AllocationItem[] = [
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
  { key: "crypto", label: "Crypto", value: 0 },
];

export const DEFAULT_INSIGHTS: Insight[] = [
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

// Properties now live in lib/property-data.ts

export const DEFAULT_LOCATION_DISTRIBUTION: LocationDistributionItem[] = [
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

// Re-export types that tabs need from child components
export type { Insight, LocationKey, LocationOption, LocationDistributionItem };
