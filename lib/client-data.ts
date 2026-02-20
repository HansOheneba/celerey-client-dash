import { mockUser, getUserAge, getUserFullName } from "@/lib/user-data";

// ============================================================================
// PORTFOLIO DATA (Assets Page)
// ============================================================================
export const portfolioData = {
  totalValue: 1250000,
  allocation: {
    stocks: {
      percentage: 60,
      value: 750000,
    },
    bonds: {
      percentage: 25,
      value: 312500,
    },
    cash: {
      percentage: 10,
      value: 125000,
    },
    alternatives: {
      percentage: 5,
      value: 62500,
    },
  },
  properties: [
    {
      id: "prop-1",
      name: "Primary Residence",
      value: 850000,
      mortgage: 450000,
      equity: 400000,
    },
    {
      id: "prop-2",
      name: "Rental Property",
      value: 525000,
      mortgage: 325000,
      equity: 200000,
    },
  ],
  totalRealEstate: 1375000,
  totalRealEstateEquity: 600000,
};

// ============================================================================
// PERSONAL DATA
// ============================================================================
export const personalData = {
  name: getUserFullName(mockUser),
  get currentAge() {
    return getUserAge(mockUser);
  },
  retirementAge: 55,
  lifeExpectancy: 95,
};

// ============================================================================
// SAVINGS & CONTRIBUTIONS
// ============================================================================
export const savingsData = {
  monthlySavings: 14300,
  annualBonus: 50000,
  expectedAnnualRaise: 0.03, // 3% annual raise
};

// ============================================================================
// INVESTMENT ASSUMPTIONS
// ============================================================================
export const investmentAssumptions = {
  expectedReturnPct: 7, // 7% expected annual return
  inflationPct: 3, // 3% inflation
  safeWithdrawalRatePct: 4, // 4% SWR rule
};

// ============================================================================
// RETIREMENT LIFESTYLE
// ============================================================================
export const retirementLifestyle = {
  desiredMonthlyIncome: 18500, // Desired monthly income in today's dollars
  expectedExpenses: {
    housing: 4000,
    healthcare: 2500,
    food: 2000,
    utilities: 800,
    insurance: 1200,
    entertainment: 3000,
    travel: 3000,
    other: 2000,
  },
};

// ============================================================================
// COMPUTED VALUES (derived from above data)
// ============================================================================
export const computedData = {
  yearsToRetirement: personalData.retirementAge - personalData.currentAge,
  monthlyExpenses: Object.values(retirementLifestyle.expectedExpenses).reduce(
    (a, b) => a + b,
    0,
  ),
  currentInvested: portfolioData.totalValue,
  totalNetWorth: portfolioData.totalValue + portfolioData.totalRealEstateEquity,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all client data as a single object
 */
export function getClientData() {
  return {
    portfolio: portfolioData,
    personal: personalData,
    savings: savingsData,
    assumptions: investmentAssumptions,
    lifestyle: retirementLifestyle,
    computed: computedData,
  };
}

/**
 * Update portfolio total and cascade to computed values
 */
export function updatePortfolioValue(newValue: number) {
  portfolioData.totalValue = newValue;
  computedData.currentInvested = newValue;
  computedData.totalNetWorth =
    portfolioData.totalValue + portfolioData.totalRealEstateEquity;
}

/**
 * Update savings amount
 */
export function updateMonthlySavings(amount: number) {
  savingsData.monthlySavings = amount;
}

/**
 * Update retirement age and recalculate years to retirement
 */
export function updateRetirementAge(age: number) {
  personalData.retirementAge = age;
  computedData.yearsToRetirement =
    personalData.retirementAge - personalData.currentAge;
}

// Current age is now automatically derived from the user's date of birth.
// No manual update needed — it stays in sync with the User profile.

/**
 * Update desired monthly income
 */
export function updateDesiredMonthlyIncome(amount: number) {
  retirementLifestyle.desiredMonthlyIncome = amount;
}

/**
 * Update investment assumptions
 */
export function updateInvestmentAssumptions(
  assumptions: Partial<typeof investmentAssumptions>,
) {
  Object.assign(investmentAssumptions, assumptions);
}

/**
 * Get retirement projection inputs
 */
export function getRetirementProjectionInputs() {
  return {
    currentAge: personalData.currentAge,
    retirementAge: personalData.retirementAge,
    currentInvested: portfolioData.totalValue,
    monthlySavings: savingsData.monthlySavings,
    expectedReturnPct: investmentAssumptions.expectedReturnPct,
    inflationPct: investmentAssumptions.inflationPct,
    safeWithdrawalRatePct: investmentAssumptions.safeWithdrawalRatePct,
    desiredMonthlyIncome: retirementLifestyle.desiredMonthlyIncome,
    existingPensionBalance: 185000,
    monthlyPensionContribution: 3200,
  };
}

// ============================================================================
// CASH FLOW DATA
// ============================================================================
export type MoneyRow = {
  id: string;
  name: string;
  amount: number;
};

export const cashFlowData = {
  income: [
    { id: "i_salary", name: "Salary", amount: 22000 },
    { id: "i_rent", name: "Rental Income", amount: 2800 },
    { id: "i_div", name: "Dividends", amount: 2500 },
    { id: "i_side", name: "Passive Income", amount: 1200 },
  ] as MoneyRow[],
  expenses: [
    { id: "e_housing", name: "Housing", amount: 4200 },
    { id: "e_living", name: "Living", amount: 3500 },
    { id: "e_ins", name: "Insurance", amount: 1230 },
    { id: "e_child", name: "Children", amount: 2100 },
    { id: "e_disc", name: "Discretionary", amount: 1800 },
    { id: "e_other", name: "Other", amount: 1370 },
  ] as MoneyRow[],
  settings: {
    emergencyFundMonths: 6,
  },
};

// ============================================================================
// GOALS DATA
// ============================================================================
export type Goal = {
  id: string;
  title: string;
  yearsRemaining: number;
  current: number;
  target: number;
  completed: boolean;
  completedDate?: string; // Optional: when the goal was completed
};

export type Scenario = {
  key:
    | "salaryIncrease"
    | "marketDownturn"
    | "earlyRetirement"
    | "propertyPurchase";
  label: string;
  description: string;
  monthlyMultiplier: number;
  probabilityDelta: number;
};

export const goalsData = {
  goals: [
    {
      id: "vac",
      title: "Vacation Home",
      yearsRemaining: 4,
      current: 340000,
      target: 850000,
      completed: false,
    },
    {
      id: "edu",
      title: "Children Education",
      yearsRemaining: 12,
      current: 180000,
      target: 400000,
      completed: false,
    },
    {
      id: "biz",
      title: "Business Venture",
      yearsRemaining: 2,
      current: 175000,
      target: 250000,
      completed: false,
    },
    {
      id: "car",
      title: "Dream Car Purchase",
      yearsRemaining: 1,
      current: 85000,
      target: 120000,
      completed: false,
    },

    {
      id: "wedding",
      title: "Daughter's Wedding Fund",
      yearsRemaining: 5,
      current: 65000,
      target: 100000,
      completed: false,
    },
    // Completed goals
    {
      id: "emergency",
      title: "Emergency Fund",
      yearsRemaining: 0,
      current: 85000,
      target: 85000,
      completed: true,
      completedDate: "December 2025",
    },
    {
      id: "debt",
      title: "Credit Card Debt Elimination",
      yearsRemaining: 0,
      current: 35000,
      target: 35000,
      completed: true,
      completedDate: "August 2024",
    },
    {
      id: "renovation",
      title: "Home Renovation",
      yearsRemaining: 0,
      current: 120000,
      target: 120000,
      completed: true,
      completedDate: "March 2025",
    },
  ] as Goal[],
  scenarios: [
    {
      key: "salaryIncrease" as const,
      label: "Salary Increase",
      description:
        "Monthly contribution pressure reduces; probability improves slightly.",
      monthlyMultiplier: 0.85,
      probabilityDelta: 4,
    },
    {
      key: "marketDownturn" as const,
      label: "Market Downturn",
      description:
        "More contribution required to stay on track; probability drops.",
      monthlyMultiplier: 1.15,
      probabilityDelta: -8,
    },
    {
      key: "earlyRetirement" as const,
      label: "Early Retirement",
      description:
        "Shorter runway; contribution required increases; probability reduces.",
      monthlyMultiplier: 1.25,
      probabilityDelta: -10,
    },
    {
      key: "propertyPurchase" as const,
      label: "Property Purchase",
      description:
        "Liquidity impact; contribution requirement increases slightly.",
      monthlyMultiplier: 1.1,
      probabilityDelta: -5,
    },
  ] as Scenario[],
};

// ============================================================================
// ADVISOR DATA
// ============================================================================
export type Advisor = {
  initials: string;
  name: string;
  title: string;
  credentials: string[];
  location: string;
  email: string;
  phone: string;
  availability: "available" | "limited" | "away";
  bio: string;
  specialties: string[];
  philosophy: string;
};

export type ActionItem = {
  id: string;
  label: string;
  dueLabel: string;
  done: boolean;
};

export type Note = {
  id: string;
  dateLabel: string;
  text: string;
};

export type Meeting = {
  title: string;
  dateLabel: string;
  type: "review" | "checkin";
  status: "scheduled" | "requested";
};

export const advisorData = {
  advisor: {
    initials: "JA",
    name: "Jude Addo",
    title: "Senior Wealth Advisor",
    credentials: ["CFP®", "CFA"],
    location: "New York, USA",
    email: "j.addo@celerey.co",
    phone: "+1 (555) 012-9090",
    availability: "limited" as const,
    bio: "James supports high-net-worth families with long-term portfolio strategy, tax-aware planning, and risk management. His style is structured and calm - focusing on clear decisions, measurable outcomes, and fewer surprises.",
    specialties: [
      "Tax-aware investing",
      "Retirement & longevity planning",
      "Trust & estate coordination",
      "Concentrated equity mitigation",
    ],
    philosophy:
      "Build a portfolio you can stick with. We aim for durable plans: resilient in drawdowns, sensible in good years, and aligned with the life you want.",
  } as Advisor,
  upcomingMeeting: {
    title: "Quarterly Review",
    dateLabel: "Jan 18, 2024 at 10:00 AM",
    type: "review" as const,
    status: "scheduled" as const,
  } as Meeting,
  actionItems: [
    {
      id: "a1",
      label: "Review trust structure proposal",
      dueLabel: "Due Jan 20, 2026",
      done: false,
    },
    {
      id: "a2",
      label: "Update risk profile questionnaire",
      dueLabel: "Due Jan 25, 2026",
      done: false,
    },
    {
      id: "a3",
      label: "Confirm updated IPS",
      dueLabel: "Due Jan 10, 2026",
      done: true,
    },
  ] as ActionItem[],
  notes: [
    {
      id: "n1",
      dateLabel: "Jan 5, 2024",
      text: "Discussed tax optimization strategies. Alexandra to review trust structure documentation.",
    },
    {
      id: "n2",
      dateLabel: "Dec 15, 2023",
      text: "Annual review completed. All goals on track. Adjusted retirement projections based on salary increase.",
    },
  ] as Note[],
};

// ============================================================================
// AI INSIGHTS DATA
// ============================================================================
export type AIInsight = {
  id: string;
  kind: "opportunity" | "risk" | "milestone" | "action";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  cta?: { label: string };
};

export const aiInsights = [
  {
    id: "optimize-tax",
    kind: "opportunity" as const,
    title: "Optimize Tax Position",
    description:
      "You could save approximately $12,400 annually by restructuring your investment income through a family trust.",
    priority: "high" as const,
    cta: { label: "Discuss with Advisor" },
  },
  {
    id: "concentration",
    kind: "risk" as const,
    title: "Portfolio Concentration",
    description:
      "Technology stocks represent 35% of your equity allocation. Consider diversifying to reduce sector risk.",
    priority: "medium" as const,
    cta: { label: "Review Portfolio" },
  },
  {
    id: "milestone",
    kind: "milestone" as const,
    title: "Goal Milestone Reached",
    description:
      "Your vacation home fund has crossed the 40% threshold. You're 6 months ahead of schedule.",
    priority: "low" as const,
    cta: { label: "View Details" },
  },
  {
    id: "insurance",
    kind: "action" as const,
    title: "Insurance Review Due",
    description:
      "Your home insurance hasn't been reviewed in 18 months. Property values have increased significantly.",
    priority: "medium" as const,
    cta: { label: "Schedule Review" },
  },
] as AIInsight[];
