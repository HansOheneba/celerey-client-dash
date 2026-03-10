// ============================================================================
// NET WORTH CALCULATION
// Aggregates data from assets, properties, insurance, and cash flow
// ============================================================================

import {
  mockHoldings,
  mockValuations,
  currentValue,
  type AssetHolding,
  type AssetValuation,
} from "@/lib/asset-data";
import {
  mockProperties,
  propertyEquity,
  totalInsurancePremium,
  totalPropertyLienBalance,
  type Property,
} from "@/lib/property-data";
import {
  mockInsurancePolicies,
  totalAnnualPremiums as totalGeneralPremiums,
  type InsurancePolicy,
} from "@/lib/insurance-data";
import { cashFlowData } from "@/lib/client-data";
import { getNetWorthHistory, pushNetWorthSnapshot } from "@/lib/storage";

// ── Other assets ────────────────────────────────────────────────
/** Miscellaneous assets that aren't investments, cash, or property. */
export type OtherAsset = {
  id: string;
  name: string;
  value: number;
};

/** Default empty array — users populate this via the UI. */
export const mockOtherAssets: OtherAsset[] = [];

// ── Types ───────────────────────────────────────────────────────
export type NetWorthBreakdown = {
  // Assets
  investmentAssets: number; // stocks, ETFs, bonds, etc.
  cashAssets: number; // cash & equivalents
  propertyValues: number; // total property market values
  otherAssets: OtherAsset[]; // user-entered miscellaneous assets
  totalOtherAssets: number; // sum of otherAssets[].value
  totalAssets: number;

  // Liabilities
  mortgageBalances: number;
  totalLiabilities: number;

  // Net worth
  netWorth: number;

  // Cash flow (monthly)
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;

  // Insurance costs (annual)
  annualPropertyInsurance: number;
  annualGeneralInsurance: number;
  totalAnnualInsurance: number;
  monthlyInsuranceCost: number;

  // Ratios
  debtToAssetRatio: number;
  liquidityRatio: number; // cash / monthly expenses
  insuranceToIncomeRatio: number;

  // Per-category investment breakdown
  investmentByType: { type: string; value: number }[];

  // Per-property breakdown
  propertyBreakdown: {
    name: string;
    marketValue: number;
    mortgage: number;
    equity: number;
    insuranceCost: number;
  }[];
};

// ── Calculator ──────────────────────────────────────────────────
export function calculateNetWorth(
  holdings: AssetHolding[] = mockHoldings,
  valuations: AssetValuation[] = mockValuations,
  properties: Property[] = mockProperties.filter((p) => p.is_active),
  insurancePolicies: InsurancePolicy[] = mockInsurancePolicies.filter(
    (p) => p.is_active,
  ),
  income: { amount: number }[] = cashFlowData.income,
  expenses: { amount: number }[] = cashFlowData.expenses,
  otherAssets: OtherAsset[] = mockOtherAssets,
): NetWorthBreakdown {
  // ── Investment assets ─────────────────────────────────────
  const activeHoldings = holdings.filter((h) => h.is_active);

  const investmentByType: { type: string; value: number }[] = [];
  const typeMap = new Map<string, number>();

  let investmentAssets = 0;
  let cashAssets = 0;

  for (const h of activeHoldings) {
    const val = currentValue(h, valuations);

    if (h.asset_type === "cash") {
      cashAssets += val;
    } else {
      investmentAssets += val;
    }

    const existing = typeMap.get(h.asset_type) ?? 0;
    typeMap.set(h.asset_type, existing + val);
  }

  for (const [type, value] of typeMap) {
    investmentByType.push({ type, value });
  }
  investmentByType.sort((a, b) => b.value - a.value);

  // ── Properties ────────────────────────────────────────────
  const propertyValues = properties.reduce((s, p) => s + p.market_value, 0);
  // Sum ALL liens per property (mortgage + any HELOC / second mortgage)
  const mortgageBalances = properties.reduce(
    (s, p) => s + totalPropertyLienBalance(p),
    0,
  );

  const propertyBreakdown = properties.map((p) => ({
    name: p.name,
    marketValue: p.market_value,
    mortgage: totalPropertyLienBalance(p),
    equity: propertyEquity(p),
    insuranceCost: totalInsurancePremium(p),
  }));

  // ── Other assets ─────────────────────────────────────────
  const totalOtherAssets = otherAssets.reduce((s, a) => s + a.value, 0);

  // ── Totals ────────────────────────────────────────────────
  const totalAssets =
    investmentAssets + cashAssets + propertyValues + totalOtherAssets;
  const totalLiabilities = mortgageBalances;
  const netWorth = totalAssets - totalLiabilities;

  // ── Cash flow ─────────────────────────────────────────────
  const monthlyIncome = income.reduce((s, i) => s + i.amount, 0);
  const monthlyExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate =
    monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // ── Insurance ─────────────────────────────────────────────
  const annualPropertyInsurance = properties.reduce(
    (s, p) => s + totalInsurancePremium(p),
    0,
  );
  const annualGeneralInsurance = totalGeneralPremiums(insurancePolicies);
  const totalAnnualInsurance = annualPropertyInsurance + annualGeneralInsurance;
  const monthlyInsuranceCost = Math.round(totalAnnualInsurance / 12);

  // ── Ratios ────────────────────────────────────────────────
  const debtToAssetRatio =
    totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;

  const liquidityRatio =
    monthlyExpenses > 0
      ? Math.round((cashAssets / monthlyExpenses) * 10) / 10
      : 0;

  const annualIncome = monthlyIncome * 12;
  const insuranceToIncomeRatio =
    annualIncome > 0
      ? Math.round((totalAnnualInsurance / annualIncome) * 1000) / 10
      : 0;

  return {
    investmentAssets,
    cashAssets,
    propertyValues,
    otherAssets,
    totalOtherAssets,
    totalAssets,
    mortgageBalances,
    totalLiabilities,
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    annualPropertyInsurance,
    annualGeneralInsurance,
    totalAnnualInsurance,
    monthlyInsuranceCost,
    debtToAssetRatio,
    liquidityRatio,
    insuranceToIncomeRatio,
    investmentByType,
    propertyBreakdown,
  };
}

// --- Snapshot helpers ----------------------------------
export type NetWorthSnapshot = {
  ts: string; // ISO timestamp
  netWorth: number;
  breakdown: NetWorthBreakdown;
};

export function createNetWorthSnapshot(
  holdings: AssetHolding[] = mockHoldings,
  valuations: AssetValuation[] = mockValuations,
  properties: Property[] = mockProperties.filter((p) => p.is_active),
  insurancePolicies: InsurancePolicy[] = mockInsurancePolicies.filter(
    (p) => p.is_active,
  ),
  income: { amount: number }[] = cashFlowData.income,
  expenses: { amount: number }[] = cashFlowData.expenses,
): NetWorthSnapshot {
  const breakdown = calculateNetWorth(
    holdings,
    valuations,
    properties,
    insurancePolicies,
    income,
    expenses,
  );

  return {
    ts: new Date().toISOString(),
    netWorth: breakdown.netWorth,
    breakdown,
  };
}

export function computePercentChange(previous: number, current: number) {
  if (!isFinite(previous) || previous === 0) return null;
  const diff = current - previous;
  return (diff / Math.abs(previous)) * 100;
}

/**
 * Record a net worth snapshot to persistent history.
 * If `dedupeDays` is provided, will not push a new snapshot if the
 * most recent snapshot is newer than that many days.
 */
export function recordNetWorthSnapshot(opts?: {
  dedupeDays?: number;
  maxEntries?: number;
}): NetWorthSnapshot {
  const snap = createNetWorthSnapshot();
  try {
    const history = getNetWorthHistory();
    if (opts?.dedupeDays && history.length > 0) {
      const last = history[history.length - 1];
      const lastTs = new Date(last.ts);
      const now = new Date(snap.ts);
      const msPerDay = 1000 * 60 * 60 * 24;
      const days = (now.getTime() - lastTs.getTime()) / msPerDay;
      if (days < opts.dedupeDays) {
        return snap; // skip pushing
      }
    }
    // augment snapshot with quick lookup fields (percent change and trend)
    const prev = history.length > 0 ? history[history.length - 1] : null;
    const rawPct = prev
      ? computePercentChange(prev.netWorth, snap.netWorth)
      : null;
    const pct = rawPct === null ? null : Math.round(rawPct * 10) / 10;
    const trend: "up" | "down" | "flat" | undefined =
      pct === null ? undefined : pct > 0 ? "up" : pct < 0 ? "down" : "flat";

    const item = {
      ts: snap.ts,
      netWorth: snap.netWorth,
      breakdown: snap.breakdown,
      percentChange: pct,
      trend,
      previousNetWorth: prev ? prev.netWorth : null,
    };

    pushNetWorthSnapshot(item, opts?.maxEntries ?? 500);
  } catch {
    // noop
  }
  return snap;
}

export function getLatestNetWorthChange(): {
  percent: number | null;
  since: string | null;
  previous?: number;
  current?: number;
} {
  const history = getNetWorthHistory();
  if (history.length === 0) return { percent: null, since: null };
  const latest = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : null;
  if (!prev) return { percent: null, since: null, current: latest.netWorth };
  const pct = computePercentChange(prev.netWorth, latest.netWorth);
  return {
    percent: pct === null ? null : Math.round(pct * 10) / 10,
    since: prev.ts,
    previous: prev.netWorth,
    current: latest.netWorth,
  };
}
