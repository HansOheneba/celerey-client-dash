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

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function compoundFutureValue({
  pv,
  pmt,
  years,
  annualRate,
}: {
  pv: number;
  pmt: number;
  years: number;
  annualRate: number;
}): number {
  const months = Math.max(0, Math.round(years * 12));
  const r = annualRate / 12;

  if (months === 0) return pv;
  if (Math.abs(r) < 1e-9) return pv + pmt * months;

  const factor = Math.pow(1 + r, months);
  return pv * factor + pmt * ((factor - 1) / r);
}

export function requiredNestEgg({
  desiredMonthlyIncomeToday,
  inflationRate,
  years,
  swr,
}: {
  desiredMonthlyIncomeToday: number;
  inflationRate: number;
  years: number;
  swr: number;
}): number {
  const desiredMonthlyAtRetirement =
    desiredMonthlyIncomeToday * Math.pow(1 + inflationRate, years);
  const annualIncomeAtRetirement = desiredMonthlyAtRetirement * 12;
  if (swr <= 0) return Infinity;
  return annualIncomeAtRetirement / swr;
}

export function parseMoney(input: string): number {
  const cleaned = input.replace(/[^\d.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function calculateAdjustmentsToReachTarget({
  currentInvested,
  monthlySavings,
  yearsToRetirement,
  expectedReturnPct,
  requiredAmount,
  projectedNestEgg,
  currentAge,
  retirementAge,
  desiredMonthlyIncome,
  inflationPct,
  safeWithdrawalRatePct,
}: {
  currentInvested: number;
  monthlySavings: number;
  yearsToRetirement: number;
  expectedReturnPct: number;
  requiredAmount: number;
  projectedNestEgg: number;
  currentAge: number;
  retirementAge: number;
  desiredMonthlyIncome: number;
  inflationPct: number;
  safeWithdrawalRatePct: number;
}): {
  monthlySavingsIncrease: number;
  retirementAgeDelay: number;
  monthlyIncomeReduction: number;
  currentInvestmentBoost: number;
} {
  // If already at target, no adjustments needed
  if (projectedNestEgg >= requiredAmount) {
    return {
      monthlySavingsIncrease: 0,
      retirementAgeDelay: 0,
      monthlyIncomeReduction: 0,
      currentInvestmentBoost: 0,
    };
  }

  const shortfall = requiredAmount - projectedNestEgg;

  // 1. Monthly savings increase needed
  // We need to find the additional monthly savings that would close the gap
  const r = expectedReturnPct / 100 / 12;
  const months = yearsToRetirement * 12;
  let monthlySavingsIncrease = 0;

  if (months > 0) {
    if (Math.abs(r) < 1e-9) {
      monthlySavingsIncrease = shortfall / months;
    } else {
      const factor = Math.pow(1 + r, months);
      monthlySavingsIncrease = shortfall / ((factor - 1) / r);
    }
  }

  // 2. Retirement age delay needed
  // Find how many extra years needed at current savings rate
  let retirementAgeDelay = 0;
  if (monthlySavings > 0 || currentInvested > 0) {
    // Binary search for the required years
    let low = 0,
      high = 20;
    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      const futureValue = compoundFutureValue({
        pv: currentInvested,
        pmt: monthlySavings,
        years: yearsToRetirement + mid,
        annualRate: expectedReturnPct / 100,
      });
      if (futureValue < requiredAmount) {
        low = mid;
      } else {
        high = mid;
      }
    }
    retirementAgeDelay = Math.ceil(((high + low) / 2) * 12) / 12; // Round to 0.5 years
  }

  // 3. Monthly income reduction needed
  // Reduce desired income to match what current trajectory can support
  const currentMonthlyAtRetirement =
    (projectedNestEgg * safeWithdrawalRatePct) / 100 / 12;
  const futureInflationFactor = Math.pow(
    1 + inflationPct / 100,
    yearsToRetirement,
  );
  const monthlyIncomeReduction = Math.max(
    0,
    desiredMonthlyIncome - currentMonthlyAtRetirement / futureInflationFactor,
  );

  // 4. Current investment boost needed
  // How much additional investment today would close the gap?
  const currentInvestmentBoost =
    shortfall / Math.pow(1 + expectedReturnPct / 100, yearsToRetirement);

  return {
    monthlySavingsIncrease: Math.round(monthlySavingsIncrease),
    retirementAgeDelay: Math.max(0, retirementAgeDelay),
    monthlyIncomeReduction: Math.round(monthlyIncomeReduction),
    currentInvestmentBoost: Math.round(currentInvestmentBoost),
  };
}
