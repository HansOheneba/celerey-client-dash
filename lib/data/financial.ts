// ============================================================================
// FINANCIAL DOMAIN DATA (dummy / seed)
// Replace the exported constants with API responses when the backend is ready.
// Shape must stay identical to the types in lib/types/financial.ts.
// ============================================================================

import type {
  Account,
  Liability,
  PropertyAsset,
  PerformancePoint,
  AllocationSlice,
  TaxProfile,
  EmergencyFundConfig,
  InsurancePolicy,
  CashFlowRow,
  ExpenseCategory,
  SectionFreshness,
  FinancialDomainData,
  RetirementConfig,
} from "@/lib/types/financial";

// ── Accounts ──────────────────────────────────────────────────────────────
export const mockAccounts: Account[] = [
  {
    id: "acc-brokerage",
    name: "Brokerage Account",
    institution: "Fidelity",
    type: "taxable",
    balance: 440000,
    currency: "USD",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "acc-401k",
    name: "401(k)",
    institution: "Vanguard",
    type: "retirement",
    balance: 380000,
    currency: "USD",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "acc-roth",
    name: "Roth IRA",
    institution: "Vanguard",
    type: "retirement",
    balance: 180000,
    currency: "USD",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "acc-checking",
    name: "Checking Account",
    institution: "Chase",
    type: "cash",
    balance: 55000,
    currency: "USD",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "acc-savings",
    name: "High-Yield Savings",
    institution: "Marcus",
    type: "cash",
    balance: 70000,
    currency: "USD",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "acc-hysa2",
    name: "Emergency Reserve",
    institution: "Ally",
    type: "cash",
    balance: 62500,
    currency: "USD",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "acc-crypto",
    name: "Crypto Portfolio",
    institution: "Coinbase",
    type: "crypto",
    balance: 62500,
    currency: "USD",
    updatedAt: "2026-03-02T06:30:00Z",
  },
];

// ── Liabilities ───────────────────────────────────────────────────────────
export const mockLiabilities: Liability[] = [
  {
    id: "liab-mort-1",
    name: "Primary Residence Mortgage",
    type: "mortgage",
    balance: 450000,
    interestRatePct: 3.25,
    minPaymentMonthly: 2100,
    dueDay: 1,
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "liab-mort-2",
    name: "Rental Property Mortgage",
    type: "mortgage",
    balance: 325000,
    interestRatePct: 3.75,
    minPaymentMonthly: 1650,
    dueDay: 1,
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "liab-cc-1",
    name: "Chase Sapphire Card",
    type: "credit_card",
    balance: 8500,
    interestRatePct: 19.99,
    minPaymentMonthly: 250,
    dueDay: 15,
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "liab-auto-1",
    name: "Auto Loan - BMW",
    type: "auto_loan",
    balance: 22000,
    interestRatePct: 4.9,
    minPaymentMonthly: 520,
    dueDay: 10,
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "liab-personal-1",
    name: "Personal Loan",
    type: "personal_loan",
    balance: 15000,
    interestRatePct: 8.5,
    minPaymentMonthly: 350,
    dueDay: 20,
    updatedAt: "2026-03-01T08:00:00Z",
  },
];

// ── Property Assets ───────────────────────────────────────────────────────
export const mockPropertyAssets: PropertyAsset[] = [
  {
    id: "prop-1",
    name: "Primary Residence",
    value: 850000,
    mortgageLiabilityId: "liab-mort-1",
    updatedAt: "2026-02-28T08:00:00Z",
  },
  {
    id: "prop-2",
    name: "Rental Property",
    value: 525000,
    mortgageLiabilityId: "liab-mort-2",
    updatedAt: "2026-02-28T08:00:00Z",
  },
];

// ── Portfolio Performance (Jan 2025 - Mar 2026) ───────────────────────────
export const mockPortfolioPerformance: PerformancePoint[] = [
  { month: "2025-01", value: 1000000, contributions: 14300 },
  { month: "2025-02", value: 1024000, contributions: 14300 },
  { month: "2025-03", value: 1011000, contributions: 14300 },
  { month: "2025-04", value: 1038000, contributions: 14300 },
  { month: "2025-05", value: 1065000, contributions: 14300 },
  { month: "2025-06", value: 1052000, contributions: 14300 },
  { month: "2025-07", value: 1088000, contributions: 14300 },
  { month: "2025-08", value: 1115000, contributions: 14300 },
  { month: "2025-09", value: 1103000, contributions: 14300 },
  { month: "2025-10", value: 1140000, contributions: 14300 },
  { month: "2025-11", value: 1178000, contributions: 14300 },
  { month: "2025-12", value: 1210000, contributions: 14300 },
  { month: "2026-01", value: 1228000, contributions: 14300 },
  { month: "2026-02", value: 1241000, contributions: 14300 },
  { month: "2026-03", value: 1250000, contributions: 14300 },
];

// ── Portfolio Allocation ──────────────────────────────────────────────────
export const mockAllocation: AllocationSlice[] = [
  { label: "Stocks", percentage: 60, value: 750000 },
  { label: "Bonds", percentage: 25, value: 312500 },
  { label: "Cash", percentage: 10, value: 125000 },
  { label: "Alternatives", percentage: 5, value: 62500 },
];

// ── Tax Profile ───────────────────────────────────────────────────────────
export const mockTaxProfile: TaxProfile = {
  effectiveTaxRatePct: 22,
  marginalTaxRatePct: 35,
  filingStatus: "married",
  stateOrRegion: "New York",
  updatedAt: "2026-01-15T00:00:00Z",
};

// ── Emergency Fund ────────────────────────────────────────────────────────
export const mockEmergencyFund: EmergencyFundConfig = {
  targetMonths: 6,
  currentCashBalance: 85000,
  includeAccountIds: ["acc-checking", "acc-hysa2"],
  updatedAt: "2026-03-03T10:00:00Z",
};

// ── Insurance Policies ────────────────────────────────────────────────────
export const mockInsurancePoliciesFinancial: InsurancePolicy[] = [
  {
    id: "ins-life",
    type: "life",
    name: "Term Life Insurance",
    premiumMonthly: 250,
    coverageAmount: 2000000,
    renewalDate: "2030-06-01",
    lastReviewedAt: "2025-07-10",
    notes: "20-year term policy. Beneficiary: spouse.",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ins-health",
    type: "health",
    name: "Family Health Plan",
    premiumMonthly: 450,
    coverageAmount: 500000,
    renewalDate: "2026-12-31",
    lastReviewedAt: "2025-12-01",
    notes: "PPO plan. Covers all 4 family members.",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ins-home-1",
    type: "home",
    name: "Primary Residence Insurance",
    premiumMonthly: 180,
    coverageAmount: 850000,
    renewalDate: "2026-04-01",
    lastReviewedAt: "2024-09-01",
    notes: "Property values have risen significantly. Review coverage limit.",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ins-home-2",
    type: "home",
    name: "Rental Property Insurance",
    premiumMonthly: 120,
    coverageAmount: 525000,
    renewalDate: "2026-05-01",
    lastReviewedAt: "2024-05-01",
    notes: "Landlord policy. Includes liability coverage.",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ins-auto",
    type: "auto",
    name: "Auto Insurance - BMW",
    premiumMonthly: 85,
    coverageAmount: 50000,
    renewalDate: "2026-09-15",
    lastReviewedAt: "2025-09-10",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ins-disability",
    type: "disability",
    name: "Long-Term Disability",
    premiumMonthly: 150,
    coverageAmount: 120000,
    renewalDate: "2027-01-01",
    lastReviewedAt: "2025-01-15",
    notes: "Covers 60% of income. Review benefit amount after pay raise.",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "ins-umbrella",
    type: "umbrella",
    name: "Personal Umbrella Policy",
    premiumMonthly: 45,
    coverageAmount: 2000000,
    renewalDate: "2026-11-01",
    lastReviewedAt: "2025-05-20",
    updatedAt: "2026-03-01T08:00:00Z",
  },
];

// ── Income Rows ───────────────────────────────────────────────────────────
export const mockIncomeRows: CashFlowRow[] = [
  { id: "i_salary", name: "Salary", amount: 22000 },
  { id: "i_rent", name: "Rental Income", amount: 2800 },
  { id: "i_div", name: "Dividends", amount: 2500 },
  { id: "i_side", name: "Passive Income", amount: 1200 },
];

// ── Expense Categories (with essential flag) ──────────────────────────────
export const mockExpenseCategories: ExpenseCategory[] = [
  { id: "e_housing", name: "Housing", amount: 4200, essential: true },
  { id: "e_living", name: "Living", amount: 3500, essential: true },
  { id: "e_ins", name: "Insurance", amount: 1230, essential: true },
  { id: "e_child", name: "Children", amount: 2100, essential: true },
  { id: "e_disc", name: "Discretionary", amount: 1800, essential: false },
  { id: "e_other", name: "Other", amount: 1370, essential: false },
];

// ── Data Freshness ────────────────────────────────────────────────────────
export const mockFreshness: SectionFreshness[] = [
  { section: "overview", updatedAt: "2026-03-04T06:00:00Z" },
  { section: "portfolio", updatedAt: "2026-03-01T08:00:00Z" },
  { section: "cash-flow", updatedAt: "2026-03-03T10:00:00Z" },
  { section: "goals", updatedAt: "2026-03-01T08:00:00Z" },
  { section: "retirement", updatedAt: "2026-02-28T08:00:00Z" },
  { section: "insurance", updatedAt: "2026-03-01T08:00:00Z" },
  { section: "advisor", updatedAt: "2026-03-01T08:00:00Z" },
  { section: "tax", updatedAt: "2026-01-15T00:00:00Z" },
];

// ── Retirement Config ─────────────────────────────────────────────────────
export const mockRetirementConfig: RetirementConfig = {
  currentAge: 43,
  retirementAge: 60,
  lifeExpectancy: 75,
  currentInvested: 1250000,
  monthlySavings: 14300,
  existingPensionBalance: 185000,
  monthlyPensionContribution: 3200,
  expectedReturnPct: 7,
  inflationPct: 3,
  safeWithdrawalRatePct: 4,
  desiredMonthlyIncome: 18500,
};

// ── Assembled Domain Bundle ───────────────────────────────────────────────
export const financialDomainData: FinancialDomainData = {
  accounts: mockAccounts,
  liabilities: mockLiabilities,
  propertyAssets: mockPropertyAssets,
  portfolioPerformance: mockPortfolioPerformance,
  allocation: mockAllocation,
  taxProfile: mockTaxProfile,
  emergencyFund: mockEmergencyFund,
  insurancePolicies: mockInsurancePoliciesFinancial,
  incomeRows: mockIncomeRows,
  expenseCategories: mockExpenseCategories,
  freshness: mockFreshness,
  retirement: mockRetirementConfig,
};

/**
 * Returns the full financial domain data.
 * Swap this for an API call when the backend is ready.
 */
export function getFinancialDomainData(): FinancialDomainData {
  return financialDomainData;
}
