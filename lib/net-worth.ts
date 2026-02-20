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
  type Property,
} from "@/lib/property-data";
import {
  mockInsurancePolicies,
  totalAnnualPremiums as totalGeneralPremiums,
  type InsurancePolicy,
} from "@/lib/insurance-data";
import { cashFlowData } from "@/lib/client-data";

// ── Types ───────────────────────────────────────────────────────
export type NetWorthBreakdown = {
  // Assets
  investmentAssets: number; // stocks, ETFs, bonds, etc.
  cashAssets: number; // cash & equivalents
  propertyValues: number; // total property market values
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
  const mortgageBalances = properties.reduce(
    (s, p) => s + p.mortgage_balance,
    0,
  );

  const propertyBreakdown = properties.map((p) => ({
    name: p.name,
    marketValue: p.market_value,
    mortgage: p.mortgage_balance,
    equity: propertyEquity(p),
    insuranceCost: totalInsurancePremium(p),
  }));

  // ── Totals ────────────────────────────────────────────────
  const totalAssets = investmentAssets + cashAssets + propertyValues;
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
