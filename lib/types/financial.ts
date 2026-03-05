// ============================================================================
// FINANCIAL DOMAIN TYPES
// Designed for backend-compatibility: when the API is ready, replace the
// dummy data module with actual fetch calls -- the shape stays the same.
// ============================================================================

/** ISO 8601 date string e.g. "2025-01-15" */
export type ISODateString = string;
/** ISO 8601 month string e.g. "2025-01" */
export type ISOMonthString = string;
/** ISO 8601 datetime string */
export type ISODateTimeString = string;
/** 3-letter ISO 4217 currency code */
export type CurrencyCode = string;

// ── Accounts ──────────────────────────────────────────────────────────────
export type AccountType =
  | "taxable"
  | "retirement"
  | "cash"
  | "crypto"
  | "other";

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  balance: number;
  currency: CurrencyCode;
  updatedAt: ISODateTimeString;
}

// ── Liabilities ───────────────────────────────────────────────────────────
export type LiabilityType =
  | "mortgage"
  | "credit_card"
  | "personal_loan"
  | "auto_loan"
  | "student_loan"
  | "other";

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  balance: number;
  interestRatePct: number;
  minPaymentMonthly: number;
  dueDay?: number;
  updatedAt: ISODateTimeString;
}

// ── Property Assets ───────────────────────────────────────────────────────
export interface PropertyAsset {
  id: string;
  name: string;
  value: number;
  /** References a Liability with type "mortgage" */
  mortgageLiabilityId?: string;
  updatedAt: ISODateTimeString;
}

// ── Portfolio Performance ─────────────────────────────────────────────────
export interface PerformancePoint {
  month: ISOMonthString;
  value: number;
  contributions: number;
}

// ── Portfolio Allocation ──────────────────────────────────────────────────
export interface AllocationSlice {
  label: string;
  percentage: number;
  value: number;
}

// ── Tax Profile ───────────────────────────────────────────────────────────
export type FilingStatus = "single" | "married" | "other";

export interface TaxProfile {
  effectiveTaxRatePct: number;
  marginalTaxRatePct: number;
  filingStatus: FilingStatus;
  stateOrRegion?: string;
  updatedAt: ISODateTimeString;
}

// ── Emergency Fund ────────────────────────────────────────────────────────
export interface EmergencyFundConfig {
  targetMonths: number;
  currentCashBalance: number;
  /** Optional: account IDs included in the emergency cash balance */
  includeAccountIds?: string[];
  updatedAt: ISODateTimeString;
}

// ── Insurance Policy ──────────────────────────────────────────────────────
export type InsurancePolicyType =
  | "home"
  | "health"
  | "life"
  | "disability"
  | "auto"
  | "umbrella"
  | "other";

export interface InsurancePolicy {
  id: string;
  type: InsurancePolicyType;
  name: string;
  premiumMonthly: number;
  coverageAmount: number;
  renewalDate: ISODateString;
  lastReviewedAt: ISODateString;
  notes?: string;
  updatedAt: ISODateTimeString;
}

// ── Cash Flow Row ─────────────────────────────────────────────────────────
export interface CashFlowRow {
  id: string;
  name: string;
  amount: number;
}

// ── Expense Category (with essential flag) ────────────────────────────────
export interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  /** true = essential (housing, food, utilities); false = discretionary */
  essential: boolean;
}

// ── Data Freshness ─────────────────────────────────────────────────────────
export interface SectionFreshness {
  section: string;
  updatedAt: ISODateTimeString;
}

// ── Full Financial Domain Bundle ──────────────────────────────────────────
export interface FinancialDomainData {
  accounts: Account[];
  liabilities: Liability[];
  propertyAssets: PropertyAsset[];
  portfolioPerformance: PerformancePoint[];
  allocation: AllocationSlice[];
  taxProfile: TaxProfile;
  emergencyFund: EmergencyFundConfig;
  insurancePolicies: InsurancePolicy[];
  incomeRows: CashFlowRow[];
  expenseCategories: ExpenseCategory[];
  freshness: SectionFreshness[];
  /** Retirement & personal config carried forward from existing data */
  retirement: RetirementConfig;
}

export interface RetirementConfig {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentInvested: number;
  monthlySavings: number;
  existingPensionBalance: number;
  monthlyPensionContribution: number;
  expectedReturnPct: number;
  inflationPct: number;
  safeWithdrawalRatePct: number;
  desiredMonthlyIncome: number;
}

// ── Selector Output Types ─────────────────────────────────────────────────

export interface NetWorthBreakdownMetrics {
  totalInvestments: number;
  totalCash: number;
  totalPropertyValue: number;
  totalOtherAssets: number;
  totalAssets: number;
  totalMortgages: number;
  totalShortTermDebt: number;
  totalLiabilities: number;
  totalNetWorth: number;
  liquidNetWorth: number;
}

export interface CashFlowMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  savingsRate: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  afterTaxMonthlyIncome: number;
  estimatedAnnualTaxes: number;
}

export interface EmergencyFundMetrics {
  currentBalance: number;
  targetBalance: number;
  runwayMonths: number;
  targetMonths: number;
  funded: boolean;
  shortfallOrSurplus: number;
}

export interface GoalMetrics {
  id: string;
  title: string;
  progressPct: number;
  requiredMonthly: number;
  onTrack: boolean;
  yearsRemaining: number;
  current: number;
  target: number;
  completed: boolean;
  completedDate?: string;
}

export interface RetirementOutputs {
  yearsToRetirement: number;
  projectedBalanceAtRetirement: number;
  sustainableAnnualIncome: number;
  sustainableMonthlyIncome: number;
  inflationAdjustedSustainableMonthlyIncome: number;
  incomeGap: number;
  onTrack: boolean;
}

export interface PerformanceMetrics {
  ytdReturnPct: number | null;
  oneYearReturnPct: number | null;
  totalContributions: number;
  totalGrowth: number;
}

export interface LiquidityMetrics {
  liquidAssets: number;
  shortTermLiabilities: number;
  liquidNetWorth: number;
  liquidityRatio: number;
}

export interface InsuranceReviewStatus {
  id: string;
  name: string;
  type: InsurancePolicyType;
  reviewDue: boolean;
  daysSinceReview: number;
  renewalDate: ISODateString;
  premiumMonthly: number;
  coverageAmount: number;
}

export interface DashboardMetrics {
  netWorth: NetWorthBreakdownMetrics;
  cashFlow: CashFlowMetrics;
  emergencyFund: EmergencyFundMetrics;
  goals: GoalMetrics[];
  retirement: RetirementOutputs;
  performance: PerformanceMetrics;
  liquidity: LiquidityMetrics;
  insurance: InsuranceReviewStatus[];
}
