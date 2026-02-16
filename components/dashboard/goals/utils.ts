import { cashFlowData } from "@/lib/client-data";
import { Goal, EnrichedGoal } from "./types";

// ============================================================================
// FORMATTING & UTILITY FUNCTIONS
// ============================================================================

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function progressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return clamp((current / target) * 100, 0, 100);
}

export function probabilityTone(
  p: number,
): "default" | "secondary" | "destructive" {
  if (p >= 85) return "default";
  if (p >= 70) return "secondary";
  return "destructive";
}

// ============================================================================
// CASH FLOW CALCULATIONS
// ============================================================================

/**
 * Calculate total monthly income from cash flow data
 */
export function getTotalMonthlyIncome(): number {
  return cashFlowData.income.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Calculate total monthly expenses from cash flow data
 */
export function getTotalMonthlyExpenses(): number {
  return cashFlowData.expenses.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Calculate available monthly cash flow (income - expenses)
 */
export function getAvailableMonthlyCashFlow(): number {
  return getTotalMonthlyIncome() - getTotalMonthlyExpenses();
}

// ============================================================================
// GOAL CALCULATIONS
// ============================================================================

/**
 * Calculate monthly contribution needed to reach a goal
 * Simple calculation: (target - current) / (years * 12 months)
 * This doesn't account for investment returns, but provides a baseline
 */
export function calculateMonthlyContribution(
  current: number,
  target: number,
  yearsRemaining: number,
): number {
  if (yearsRemaining <= 0) return 0;
  const remaining = Math.max(0, target - current);
  const monthsRemaining = yearsRemaining * 12;
  return remaining / monthsRemaining;
}

/**
 * Calculate probability of achieving a goal based on available cash flow
 * Takes into account:
 * - How much is needed monthly for this goal
 * - How much is needed for all goals combined
 * - Available cash flow
 */
export function calculateGoalProbability(
  monthlyNeeded: number,
  allGoals: Goal[],
  availableCashFlow: number,
): number {
  // Calculate total monthly contributions needed across all goals
  const totalMonthlyNeeded = allGoals.reduce((sum, goal) => {
    const needed = calculateMonthlyContribution(
      goal.current,
      goal.target,
      goal.yearsRemaining,
    );
    return sum + needed;
  }, 0);

  // If total needed is 0, probability is 100%
  if (totalMonthlyNeeded === 0) return 100;

  // Calculate what percentage of available cash flow would go to this goal
  const goalPercentageOfTotal = monthlyNeeded / totalMonthlyNeeded;
  const allocatedCashFlow = availableCashFlow * goalPercentageOfTotal;

  // Calculate probability based on coverage ratio
  const coverageRatio = allocatedCashFlow / monthlyNeeded;

  // Convert coverage ratio to probability (0%-100%)
  // 100%+ coverage = 90-95% probability
  // 80-100% coverage = 75-89% probability
  // 50-80% coverage = 60-74% probability
  // <50% coverage = 30-59% probability

  let probability: number;
  if (coverageRatio >= 1.0) {
    probability = 90 + Math.min(coverageRatio - 1, 0.5) * 10; // 90-95%
  } else if (coverageRatio >= 0.8) {
    probability = 75 + (coverageRatio - 0.8) * 75; // 75-90%
  } else if (coverageRatio >= 0.5) {
    probability = 60 + (coverageRatio - 0.5) * 50; // 60-75%
  } else {
    probability = 30 + coverageRatio * 60; // 30-60%
  }

  return Math.round(Math.min(100, Math.max(0, probability)));
}

/**
 * Enrich goals with calculated values based on cash flow
 */
export function enrichGoalsWithCalculations(goals: Goal[]): EnrichedGoal[] {
  const availableCashFlow = getAvailableMonthlyCashFlow();

  // Only calculate for active (non-completed) goals
  const activeGoals = goals.filter((g) => !g.completed);

  return goals.map((goal) => {
    // For completed goals, set values to 0 and probability to 100
    if (goal.completed) {
      return {
        ...goal,
        monthlyContributionNeeded: 0,
        probability: 100,
      };
    }

    const monthlyContributionNeeded = calculateMonthlyContribution(
      goal.current,
      goal.target,
      goal.yearsRemaining,
    );

    const probability = calculateGoalProbability(
      monthlyContributionNeeded,
      activeGoals,
      availableCashFlow,
    );

    return {
      ...goal,
      monthlyContributionNeeded,
      probability,
    };
  });
}
