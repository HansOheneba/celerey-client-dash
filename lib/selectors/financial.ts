// ============================================================================
// FINANCIAL SELECTORS
// Pure functions only. No side-effects, no globals.
// Import the domain data type; call with the data object from the data layer.
// ============================================================================

import type {
  FinancialDomainData,
  Account,
  Liability,
  PerformancePoint,
  InsurancePolicy,
  ExpenseCategory,
  RetirementConfig,
  GoalMetrics,
  RetirementOutputs,
  PerformanceMetrics,
  CashFlowMetrics,
  NetWorthBreakdownMetrics,
  EmergencyFundMetrics,
  LiquidityMetrics,
  InsuranceReviewStatus,
  DashboardMetrics,
} from "@/lib/types/financial";
import type { Goal, Scenario } from "@/lib/client-data";

// ── Helpers ───────────────────────────────────────────────────────────────

/** Sum an array of numbers. */
function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/**
 * Future value of a lump sum + regular monthly contributions.
 * FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
 */
function futureValue(
  presentValue: number,
  monthlyContribution: number,
  annualReturnPct: number,
  years: number,
): number {
  const r = annualReturnPct / 100 / 12;
  const n = years * 12;
  if (r === 0) return presentValue + monthlyContribution * n;
  const growth = Math.pow(1 + r, n);
  return presentValue * growth + monthlyContribution * ((growth - 1) / r);
}

/**
 * Required monthly contribution to reach a future value target.
 * PMT = (FV - PV*(1+r)^n) / (((1+r)^n - 1) / r)
 */
function requiredMonthlyContribution(
  currentBalance: number,
  targetBalance: number,
  annualReturnPct: number,
  years: number,
): number {
  if (years <= 0) return 0;
  const r = annualReturnPct / 100 / 12;
  const n = years * 12;
  if (r === 0) {
    const gap = targetBalance - currentBalance;
    return gap > 0 ? gap / n : 0;
  }
  const growth = Math.pow(1 + r, n);
  const pvFuture = currentBalance * growth;
  const gap = targetBalance - pvFuture;
  if (gap <= 0) return 0;
  return gap / ((growth - 1) / r);
}

// ── Shared Liquid-Net-Worth Computation ─────────────────────────────────

/**
 * Single source of truth for liquid assets, short-term debt, and
 * liquid net worth.  Called by both selectNetWorthBreakdown and
 * selectLiquidityMetrics so the two modules can never diverge.
 *
 * Liquid assets = cash + taxable brokerage accounts.
 * Short-term debt = everything except mortgages.
 * Liquid net worth = liquidAssets − shortTermDebt.
 */
function computeLiquidComponents(data: FinancialDomainData): {
  liquidAssets: number;
  shortTermDebt: number;
  liquidNetWorth: number;
} {
  const liquidAssets = sum(
    data.accounts
      .filter((a) => a.type === "cash" || a.type === "taxable")
      .map((a) => a.balance),
  );
  const shortTermTypes: Liability["type"][] = [
    "credit_card",
    "personal_loan",
    "auto_loan",
    "student_loan",
    "other",
  ];
  const shortTermDebt = sum(
    data.liabilities
      .filter((l) => shortTermTypes.includes(l.type))
      .map((l) => l.balance),
  );
  return {
    liquidAssets,
    shortTermDebt,
    liquidNetWorth: liquidAssets - shortTermDebt,
  };
}

// ── Net Worth Breakdown ──────────────────────────────────────────────────

export function selectNetWorthBreakdown(
  data: FinancialDomainData,
): NetWorthBreakdownMetrics {
  const investmentTypes: Account["type"][] = [
    "taxable",
    "retirement",
    "crypto",
  ];
  const cashTypes: Account["type"][] = ["cash"];

  const totalInvestments = sum(
    data.accounts
      .filter((a) => investmentTypes.includes(a.type))
      .map((a) => a.balance),
  );
  const totalCash = sum(
    data.accounts
      .filter((a) => cashTypes.includes(a.type))
      .map((a) => a.balance),
  );
  const totalOtherAssets = sum(
    data.accounts.filter((a) => a.type === "other").map((a) => a.balance),
  );
  const totalPropertyValue = sum(data.propertyAssets.map((p) => p.value));
  const totalAssets =
    totalInvestments + totalCash + totalOtherAssets + totalPropertyValue;

  const totalMortgages = sum(
    data.liabilities.filter((l) => l.type === "mortgage").map((l) => l.balance),
  );
  // Short-term debt and liquid net worth both come from the shared helper,
  // ensuring they can never diverge from the Liquidity module.
  const { shortTermDebt: totalShortTermDebt, liquidNetWorth } =
    computeLiquidComponents(data);
  const totalLiabilities = totalMortgages + totalShortTermDebt;
  const totalNetWorth = totalAssets - totalLiabilities;

  return {
    totalInvestments,
    totalCash,
    totalPropertyValue,
    totalOtherAssets,
    totalAssets,
    totalMortgages,
    totalShortTermDebt,
    totalLiabilities,
    totalNetWorth,
    liquidNetWorth,
  };
}

// ── Cash Flow Metrics ─────────────────────────────────────────────────────

export function selectMonthlyIncome(data: FinancialDomainData): number {
  return sum(data.incomeRows.map((r) => r.amount));
}

export function selectMonthlyExpenses(data: FinancialDomainData): number {
  return sum(data.expenseCategories.map((e) => e.amount));
}

export function selectEssentialExpenses(categories: ExpenseCategory[]): number {
  return sum(categories.filter((c) => c.essential).map((c) => c.amount));
}

export function selectCashFlowMetrics(
  data: FinancialDomainData,
): CashFlowMetrics {
  const monthlyIncome = selectMonthlyIncome(data);
  const monthlyExpenses = selectMonthlyExpenses(data);
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate =
    monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;

  const essentialExpenses = selectEssentialExpenses(data.expenseCategories);
  const discretionaryExpenses = sum(
    data.expenseCategories.filter((c) => !c.essential).map((c) => c.amount),
  );

  const annualIncome = monthlyIncome * 12;
  const estimatedAnnualTaxes =
    (data.taxProfile.effectiveTaxRatePct / 100) * annualIncome;
  const afterTaxMonthlyIncome = (annualIncome - estimatedAnnualTaxes) / 12;

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    savingsRate,
    essentialExpenses,
    discretionaryExpenses,
    afterTaxMonthlyIncome,
    estimatedAnnualTaxes,
  };
}

// ── Savings Rate ──────────────────────────────────────────────────────────

export function selectSavingsRate(data: FinancialDomainData): number {
  return selectCashFlowMetrics(data).savingsRate;
}

// ── Emergency Fund ────────────────────────────────────────────────────────

export function selectEmergencyFundMetrics(
  data: FinancialDomainData,
): EmergencyFundMetrics {
  const essentialExpenses = selectEssentialExpenses(data.expenseCategories);
  const currentBalance = data.emergencyFund.currentCashBalance;
  const targetMonths = data.emergencyFund.targetMonths;
  const targetBalance = essentialExpenses * targetMonths;
  const runwayMonths =
    essentialExpenses > 0 ? currentBalance / essentialExpenses : 0;
  const funded = runwayMonths >= targetMonths;
  const shortfallOrSurplus = currentBalance - targetBalance;

  return {
    currentBalance,
    targetBalance,
    runwayMonths,
    targetMonths,
    funded,
    shortfallOrSurplus,
  };
}

// ── Goal Metrics ──────────────────────────────────────────────────────────

export function selectGoalMetrics(
  goals: Goal[],
  data: FinancialDomainData,
  assumedAnnualReturnPct: number,
): GoalMetrics[] {
  const cashFlow = selectCashFlowMetrics(data);
  // Available monthly for discretionary goals after essentials
  const availableSurplus = cashFlow.monthlySurplus;

  return goals.map((goal) => {
    const progressPct =
      goal.target > 0 ? (goal.current / goal.target) * 100 : 100;
    const required = goal.completed
      ? 0
      : requiredMonthlyContribution(
          goal.current,
          goal.target,
          assumedAnnualReturnPct,
          goal.yearsRemaining,
        );
    const onTrack = goal.completed ? true : required <= availableSurplus;

    return {
      id: goal.id,
      title: goal.title,
      progressPct: Math.min(progressPct, 100),
      requiredMonthly: required,
      onTrack,
      yearsRemaining: goal.yearsRemaining,
      current: goal.current,
      target: goal.target,
      completed: goal.completed,
      completedDate: goal.completedDate,
    };
  });
}

/**
 * Recompute goal required monthly contribution under a scenario multiplier.
 */
export function selectGoalMetricsForScenario(
  goals: Goal[],
  data: FinancialDomainData,
  assumedAnnualReturnPct: number,
  scenario: Scenario,
): GoalMetrics[] {
  const cashFlow = selectCashFlowMetrics(data);
  const adjustedSurplus = cashFlow.monthlySurplus * scenario.monthlyMultiplier;

  return goals.map((goal) => {
    const progressPct =
      goal.target > 0 ? (goal.current / goal.target) * 100 : 100;
    const required = goal.completed
      ? 0
      : requiredMonthlyContribution(
          goal.current,
          goal.target,
          assumedAnnualReturnPct,
          goal.yearsRemaining,
        );
    const adjustedRequired = required * scenario.monthlyMultiplier;
    const onTrack = goal.completed ? true : adjustedRequired <= adjustedSurplus;
    return {
      id: goal.id,
      title: goal.title,
      progressPct: Math.min(progressPct, 100),
      requiredMonthly: adjustedRequired,
      onTrack,
      yearsRemaining: goal.yearsRemaining,
      current: goal.current,
      target: goal.target,
      completed: goal.completed,
      completedDate: goal.completedDate,
    };
  });
}

// ── Retirement Outputs ────────────────────────────────────────────────────

export function selectRetirementOutputs(
  config: RetirementConfig,
): RetirementOutputs {
  const yearsToRetirement = config.retirementAge - config.currentAge;

  // --- PVA helpers --------------------------------------------------------
  // How many years the nest egg must sustain income
  const retirementYears = Math.max(
    1,
    config.lifeExpectancy - config.retirementAge,
  );
  // Real return rate (strips inflation so income target & discount rate align)
  const realRate =
    (1 + config.expectedReturnPct / 100) / (1 + config.inflationPct / 100) - 1;
  // PV-of-annuity factor: present value of $1/year for retirementYears years
  const pvFactor =
    Math.abs(realRate) < 1e-9
      ? retirementYears
      : (1 - Math.pow(1 + realRate, -retirementYears)) / realRate;
  // Effective annual withdrawal rate derived from life expectancy
  const effectiveSWR =
    pvFactor > 0 ? 1 / pvFactor : config.safeWithdrawalRatePct / 100;
  // ------------------------------------------------------------------------

  if (yearsToRetirement <= 0) {
    const sustainableAnnualIncome = config.currentInvested * effectiveSWR;
    return {
      yearsToRetirement: 0,
      projectedBalanceAtRetirement: config.currentInvested,
      sustainableAnnualIncome,
      sustainableMonthlyIncome: sustainableAnnualIncome / 12,
      inflationAdjustedSustainableMonthlyIncome: sustainableAnnualIncome / 12,
      incomeGap: 0,
      onTrack: true,
    };
  }

  const investmentFV = futureValue(
    config.currentInvested,
    config.monthlySavings,
    config.expectedReturnPct,
    yearsToRetirement,
  );
  const pensionFV = futureValue(
    config.existingPensionBalance,
    config.monthlyPensionContribution,
    config.expectedReturnPct,
    yearsToRetirement,
  );
  const projectedBalanceAtRetirement = investmentFV + pensionFV;

  // Sustainable income uses the PVA-derived effective SWR so that life expectancy
  // directly governs how much can safely be drawn down each year.
  const sustainableAnnualIncome = projectedBalanceAtRetirement * effectiveSWR;
  const sustainableMonthlyIncome = sustainableAnnualIncome / 12;

  // Discount future income to today's purchasing power
  const inflationFactor = Math.pow(
    1 + config.inflationPct / 100,
    yearsToRetirement,
  );
  const inflationAdjustedSustainableMonthlyIncome =
    sustainableMonthlyIncome / inflationFactor;

  const incomeGap =
    config.desiredMonthlyIncome - inflationAdjustedSustainableMonthlyIncome;
  const onTrack = incomeGap <= 0;

  return {
    yearsToRetirement,
    projectedBalanceAtRetirement,
    sustainableAnnualIncome,
    sustainableMonthlyIncome,
    inflationAdjustedSustainableMonthlyIncome,
    incomeGap,
    onTrack,
  };
}

// ── Performance Metrics ───────────────────────────────────────────────────

export function selectPerformanceMetrics(
  points: PerformancePoint[],
): PerformanceMetrics {
  if (points.length === 0) {
    return {
      ytdReturnPct: null,
      oneYearReturnPct: null,
      totalContributions: 0,
      totalGrowth: 0,
    };
  }

  const sorted = [...points].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1]!;
  const currentYear = latest.month.slice(0, 4);

  // YTD: compare to the last point of the previous year (or first of current)
  const prevYearEnd = sorted
    .filter((p) => p.month.startsWith(`${+currentYear - 1}`))
    .pop();
  const ytdReturnPct =
    prevYearEnd && prevYearEnd.value > 0
      ? ((latest.value - prevYearEnd.value) / prevYearEnd.value) * 100
      : null;

  // 1Y: find point 12 months ago
  const latestDate = new Date(latest.month + "-01");
  latestDate.setFullYear(latestDate.getFullYear() - 1);
  const oneYearAgoKey = latestDate.toISOString().slice(0, 7);
  const oneYearAgoPoint = sorted.find((p) => p.month === oneYearAgoKey);
  const oneYearReturnPct =
    oneYearAgoPoint && oneYearAgoPoint.value > 0
      ? ((latest.value - oneYearAgoPoint.value) / oneYearAgoPoint.value) * 100
      : null;

  const totalContributions = sum(sorted.map((p) => p.contributions));
  const totalGrowth =
    sorted.length >= 2
      ? latest.value -
        sorted[0]!.value -
        (totalContributions - sorted[0]!.contributions)
      : 0;

  return { ytdReturnPct, oneYearReturnPct, totalContributions, totalGrowth };
}

// ── Liquidity Metrics ──────────────────────────────────────────────────────

export function selectLiquidityMetrics(
  data: FinancialDomainData,
): LiquidityMetrics {
  // Re-use shared helper — liquidNetWorth is now a single computed constant.
  const {
    liquidAssets,
    shortTermDebt: shortTermLiabilities,
    liquidNetWorth,
  } = computeLiquidComponents(data);
  const essentialExpenses = selectEssentialExpenses(data.expenseCategories);
  const liquidityRatio =
    essentialExpenses > 0 ? liquidAssets / essentialExpenses : 0;

  return { liquidAssets, shortTermLiabilities, liquidNetWorth, liquidityRatio };
}

// ── Insurance Review Status ───────────────────────────────────────────────

const REVIEW_THRESHOLD_MONTHS = 12;

export function selectInsuranceReviewStatus(
  policies: InsurancePolicy[],
  asOf: Date = new Date(),
): InsuranceReviewStatus[] {
  return policies.map((p) => {
    const lastReviewed = new Date(p.lastReviewedAt);
    const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;
    const daysSinceReview = Math.floor(
      (asOf.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24),
    );
    const monthsSinceReview =
      (asOf.getTime() - lastReviewed.getTime()) / msPerMonth;
    const reviewDue = monthsSinceReview > REVIEW_THRESHOLD_MONTHS;
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      reviewDue,
      daysSinceReview,
      renewalDate: p.renewalDate,
      premiumMonthly: p.premiumMonthly,
      coverageAmount: p.coverageAmount,
    };
  });
}

// ── Total Net Worth Selector (public helper) ──────────────────────────────

export function selectTotalNetWorth(data: FinancialDomainData): number {
  return selectNetWorthBreakdown(data).totalNetWorth;
}

// ── Aggregate: All Dashboard Metrics ──────────────────────────────────────

export function selectDashboardMetrics(
  data: FinancialDomainData,
  goals: Goal[],
): DashboardMetrics {
  const netWorth = selectNetWorthBreakdown(data);
  const cashFlow = selectCashFlowMetrics(data);
  const emergencyFund = selectEmergencyFundMetrics(data);
  const goalMetrics = selectGoalMetrics(
    goals,
    data,
    data.retirement.expectedReturnPct,
  );
  const retirement = selectRetirementOutputs(data.retirement);
  const performance = selectPerformanceMetrics(data.portfolioPerformance);
  const liquidity = selectLiquidityMetrics(data);
  const insurance = selectInsuranceReviewStatus(data.insurancePolicies);

  return {
    netWorth,
    cashFlow,
    emergencyFund,
    goals: goalMetrics,
    retirement,
    performance,
    liquidity,
    insurance,
  };
}

// ── Top-level convenience ─────────────────────────────────────────────────

import { getFinancialDomainData } from "@/lib/data/financial";
import { goalsData } from "@/lib/client-data";

/**
 * Returns the raw domain data alongside all computed selector outputs.
 * Designed to be called once per page render and passed down as props.
 */
export function getDashboardData() {
  const data = getFinancialDomainData();
  const metrics = selectDashboardMetrics(data, goalsData.goals);
  return { data, metrics };
}
