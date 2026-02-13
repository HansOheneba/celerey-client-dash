export type ProjectionInputs = {
  currentAge: number;
  retirementAge: number;
  currentInvested: number;
  monthlySavings: number;
  expectedReturnPct: number;
  inflationPct: number;
  safeWithdrawalRatePct: number;
  desiredMonthlyIncome: number;
};

export type StatusTone = {
  tone: "good" | "warn";
  title: string;
};
