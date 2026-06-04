// lib/demo-user.ts
//
// Stakeholder demo data for Bill Richardson.
//
// Bill is a 34-year-old Senior Business Analyst in London, Ghanaian diaspora,
// married with one child. Net worth ~£120k, investable assets ~£40k.
// Monthly surplus £1,200-£2,000. He has assets across UK and Ghana.
//
// Set NEXT_PUBLIC_DEMO_USER=true to activate. The API is fully bypassed.

import type {
  Goal,
  GoalCategory,
  CashFlowRow,
  ExpenseCategory,
  CashFlowPoint,
  AssetHolding,
  InsurancePolicy,
  Property,
  Liability,
  RetirementConfig,
  User,
  PerformancePoint,
} from "@/lib/client-data";
import type { ApiCashFlowSummary } from "@/lib/dashboard-api";
import type {
  LegacyState,
  WillInfo,
  Beneficiary,
  Dependent,
  DigitalAsset,
  LetterOfWishes,
} from "@/store/financialStore";

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_USER === "true";

const NOW = new Date().toISOString();

// ============================================================================
// USER PROFILE
// ============================================================================

export const DEMO_USER: User = {
  user_id: "u-br-94712",
  first_name: "Bill",
  last_name: "Richardson",
  display_name: "Bill Richardson",
  email: "bill.richardson@meridianfs.co.uk",
  phone_number: "+44 7700 900 142",
  resident_country: "UK",
  city: "London",
  citizenships: ["UK", "Ghana"],
  date_of_birth: "1992-03-14",
  user_type: "regular",
  currency: "GBP",
  preferred_contact: "Email",
  is_active: true,
  created_at: "2024-09-01T00:00:00Z",
  updated_at: NOW,
  occupation: "Senior Business Analyst",
  marital_status: "married",
  prefix: "Mr",
  gender: "M",
  account_mode: "solo",
  risk_profile: "moderate",
  dependents: 2,
  bio: "Senior Business Analyst at a financial services firm in London. Ghanaian diaspora. Building cross-border wealth for my family across the UK and Ghana.",
};

// ============================================================================
// INCOME ROWS
// ============================================================================

export const DEMO_INCOME: CashFlowRow[] = [
  {
    id: "demo-inc-1",
    name: "Salary (net take-home)",
    amount: 3840,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-inc-2",
    name: "Spouse Household Contribution (Sarah)",
    amount: 2500,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2023-06-01",
  },
  {
    id: "demo-inc-3",
    name: "BR Analytics Ltd (side business)",
    amount: 240,
    isRecurring: false,
    recurringType: "monthly",
    startDate: "2024-01-01",
  },
  {
    id: "demo-inc-4",
    name: "Data Analytics Contract (Horizon Digital)",
    amount: 1060,
    isRecurring: false,
    recurringType: "one-time",
    startDate: "2025-05-01",
  },
];

// ============================================================================
// EXPENSE CATEGORIES
// ============================================================================

export const DEMO_EXPENSES: ExpenseCategory[] = [
  {
    id: "demo-exp-1",
    name: "Rent (2-bed, South London)",
    amount: 1950,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2024-03-01",
  },
  {
    id: "demo-exp-2",
    name: "Groceries & Household",
    amount: 614,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-3",
    name: "Childcare (nursery)",
    amount: 920,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2024-07-01",
  },
  {
    id: "demo-exp-4",
    name: "Family Remittances (Ghana)",
    amount: 450,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2020-01-01",
  },
  {
    id: "demo-exp-5",
    name: "Transport (Tube + National Rail)",
    amount: 187,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-6",
    name: "Utilities, Gas & Broadband",
    amount: 284,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-7",
    name: "Insurance Premiums (all policies)",
    amount: 183,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2023-01-01",
  },
  {
    id: "demo-exp-8",
    name: "Dining Out & Takeaways",
    amount: 290,
    essential: false,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-9",
    name: "Subscriptions (Netflix, Spotify, iCloud, etc.)",
    amount: 91,
    essential: false,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-10",
    name: "Clothing & Personal Care",
    amount: 165,
    essential: false,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-11",
    name: "BR Analytics Ltd - business costs",
    amount: 98,
    essential: false,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2024-01-01",
  },
  {
    id: "demo-exp-12",
    name: "Pension Contribution (Employee, 5%)",
    amount: 283,
    essential: true,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-13",
    name: "Gym Membership (PureGym)",
    amount: 26,
    essential: false,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2023-09-01",
  },
  {
    id: "demo-exp-14",
    name: "Amazon & Online Shopping",
    amount: 130,
    essential: false,
    isRecurring: true,
    recurringType: "monthly",
    startDate: "2022-01-01",
  },
  {
    id: "demo-exp-15",
    name: "Boiler Repair (one-off emergency)",
    amount: 900,
    essential: true,
    isRecurring: false,
    recurringType: "one-time",
    startDate: "2025-10-14",
  },
  {
    id: "demo-exp-16",
    name: "Dental Treatment (NHS waitlist, went private)",
    amount: 320,
    essential: true,
    isRecurring: false,
    recurringType: "one-time",
    startDate: "2025-09-08",
  },
];
// Recurring total: ~£5,671/month. Two one-off items recorded for Sep/Oct 2025.

// ============================================================================
// CASH FLOW HISTORY - 21 months (Oct 2024 to June 2026)
// ============================================================================

export const DEMO_CASH_FLOW_HISTORY: CashFlowPoint[] = [
  // Oct 2024: Side biz payment came in late, booked Ghana flights
  { month: "2024-10", income: 6350, expenses: 5920, surplus: 430 },
  // Nov 2024: Quiet month, cooked at home more, finally caught up
  { month: "2024-11", income: 6580, expenses: 4980, surplus: 1600 },
  // Dec 2024: Christmas work bonus early + Ghana trip, gifts, family party
  { month: "2024-12", income: 8650, expenses: 8140, surplus: 510 },
  // Jan 2025: Cleared December credit card. Dry January but wallet still hurt
  { month: "2025-01", income: 6580, expenses: 6840, surplus: -260 },
  // Feb 2025: Back to normal. No big events, decent save month
  { month: "2025-02", income: 6580, expenses: 5120, surplus: 1460 },
  // Mar 2025: Normal. Extra remittance to Ghana (dad's medical bill)
  { month: "2025-03", income: 6580, expenses: 5640, surplus: 940 },
  // Apr 2025: Ama's first birthday, nursery deposit increase, Easter weekend
  { month: "2025-04", income: 6580, expenses: 6200, surplus: 380 },
  // May 2025: Picked up a data analytics contract on the side, good month
  { month: "2025-05", income: 7640, expenses: 5290, surplus: 2350 },
  // Jun 2025: Flew to Ghana for cousin's wedding - flights, accommodation, celebration
  { month: "2025-06", income: 6580, expenses: 7100, surplus: -520 },
  // Jul 2025: Actively recovering from Ghana trip, skipped eating out
  { month: "2025-07", income: 6580, expenses: 5040, surplus: 1540 },
  // Aug 2025: Family trip to Algarve - flights + hotel + spending
  { month: "2025-08", income: 6580, expenses: 6350, surplus: 230 },
  // Sep 2025: Dental work (went private, NHS wait too long), general catch-up
  { month: "2025-09", income: 6580, expenses: 5610, surplus: 970 },
  // Oct 2025: Boiler broke, landlord disputed responsibility, paid £900 upfront
  { month: "2025-10", income: 6580, expenses: 6480, surplus: 100 },
  // Nov 2025: Annual performance bonus hit - the best month in 2 years
  { month: "2025-11", income: 9200, expenses: 5150, surplus: 4050 },
  // Dec 2025: Christmas, doubled Ghana remittances, bought Sarah a laptop
  { month: "2025-12", income: 8200, expenses: 8400, surplus: -200 },
  // Jan 2026: Self-assessment tax bill (£1,100 due) + Sarah took 2 weeks unpaid leave
  { month: "2026-01", income: 5240, expenses: 7640, surplus: -2400 },
  // Feb 2026: Full recovery - both incomes in, barely left the house, batch-cooked all month
  { month: "2026-02", income: 6580, expenses: 4390, surplus: 2190 },
  // Mar 2026: Sarah received NHS annual bonus, Bill got a quarterly performance uplift
  { month: "2026-03", income: 9150, expenses: 5460, surplus: 3690 },
  // Apr 2026: Ama's 2nd birthday party, car service, insurance renewal, impulse Amazon haul
  { month: "2026-04", income: 6580, expenses: 7020, surplus: -440 },
  // May 2026: BR Analytics two new clients + side project payout, expenses quiet
  { month: "2026-05", income: 7320, expenses: 4980, surplus: 2340 },
  // Jun 2026: Current month - back to baseline after a rollercoaster year
  { month: "2026-06", income: 6580, expenses: 5150, surplus: 1430 },
];

// ============================================================================
// CASH FLOW SUMMARY (current month snapshot)
// ============================================================================

export const DEMO_CASH_FLOW_SUMMARY: ApiCashFlowSummary = {
  dashboard_currency: "GBP",
  fx_rates_as_of: null,
  fx_unavailable: false,
  current_month: {
    totalIncome: 6580,
    totalExpenses: 5150,
    surplus: 1430,
    savingsRate: 0.217,
    burnRate: 0.783,
  },
  month_over_month: {
    incomeChange_pct: -10.1,
    expenseChange_pct: 3.4,
    surplusChange_pct: -38.8,
  },
  averages: {
    avgMonthlyIncome: 6892,
    avgMonthlyExpenses: 5921,
    avgMonthlySurplus: 971,
    based_on_months: 21,
  },
  emergency_fund: {
    current_cash_balance: 22000,
    monthly_baseline: 5150,
    target_amount: 30900,
    target_months: 6,
    runway_months: 4.3,
    funded_pct: 71.2,
    shortfall: 8900,
  },
};

// ============================================================================
// EMERGENCY FUND
// ============================================================================

export const DEMO_EMERGENCY_FUND = {
  cash_balance: 22000,
  target_months: 6,
  storage_location: "Marcus by Goldman Sachs (Easy-access savings)",
  computed: {
    monthly_baseline: 5150,
    target_amount: 30900,
    runway_months: 4.3,
    funded_pct: 71.2,
    shortfall: 8900,
    dashboard_currency: "GBP",
  },
};

// ============================================================================
// GOALS
// ============================================================================

export const DEMO_GOALS: Goal[] = [
  {
    id: "demo-goal-1",
    userId: "u-br-94712",
    title: "First Home Deposit",
    category: "housing" as GoalCategory,
    priority: 1,
    description:
      "Save the deposit to buy a 3-bed home in South London or commuter belt. Target deposit is 15% of a £520k property.",
    yearsRemaining: 3.0,
    current: 17840,
    target: 78000,
    completed: false,
    targetDate: "2029-06-01",
    monthlyContributionNeeded: 1667,
    probability: 63,
  },
  {
    id: "demo-goal-2",
    userId: "u-br-94712",
    title: "Emergency Fund (6 months)",
    category: "emergency" as GoalCategory,
    priority: 2,
    description:
      "Build a full 6-month emergency buffer. Currently at 4.3 months. Target: £30,900 in easy-access savings.",
    yearsRemaining: 0.8,
    current: 22000,
    target: 30900,
    completed: false,
    targetDate: "2027-03-01",
    monthlyContributionNeeded: 926,
    probability: 91,
  },
  {
    id: "demo-goal-3",
    userId: "u-br-94712",
    title: "Ghana Property Purchase",
    category: "housing" as GoalCategory,
    priority: 3,
    description:
      "Buy a residential property in Accra or Kumasi for long-term appreciation and eventual family use.",
    yearsRemaining: 2.0,
    current: 6750,
    target: 42000,
    completed: false,
    targetDate: "2028-06-01",
    monthlyContributionNeeded: 1450,
    probability: 48,
  },
  {
    id: "demo-goal-4",
    userId: "u-br-94712",
    title: "Children's Education Fund",
    category: "education" as GoalCategory,
    priority: 4,
    description:
      "University and further education fund for Ama. Targeting a pot that can cover UK tuition and living costs.",
    yearsRemaining: 14.3,
    current: 3680,
    target: 65000,
    completed: false,
    targetDate: "2040-09-01",
    monthlyContributionNeeded: 360,
    probability: 74,
  },
  {
    id: "demo-goal-5",
    userId: "u-br-94712",
    title: "Family Legacy Fund",
    category: "other" as GoalCategory,
    priority: 5,
    description:
      "A dedicated pot to support parents in Ghana, help a younger sibling with education or a business, and provide a buffer for unexpected family needs.",
    yearsRemaining: 4.0,
    current: 4140,
    target: 18000,
    completed: false,
    targetDate: "2030-06-01",
    monthlyContributionNeeded: 281,
    probability: 81,
  },
  {
    id: "demo-goal-6",
    userId: "u-br-94712",
    title: "Retirement Pot",
    category: "retirement" as GoalCategory,
    priority: 6,
    description:
      "Combined pension and investment pot to retire comfortably at 65. Desired monthly income of £3,500 in today's money.",
    yearsRemaining: 31.0,
    current: 24000,
    target: 540000,
    completed: false,
    targetDate: "2057-03-14",
    monthlyContributionNeeded: 530,
    probability: 77,
  },
];

// ============================================================================
// ASSET HOLDINGS
// ============================================================================

export const DEMO_HOLDINGS: AssetHolding[] = [
  // Stocks & Shares ISA - VWRL (Vanguard FTSE All-World)
  {
    holding_id: "demo-h-1",
    user_id: "u-br-94712",
    asset_type: "etf",
    valuation_method: "market",
    name: "Vanguard FTSE All-World ETF (VWRL)",
    symbol: "VWRL",
    cost_basis: 14000,
    current_value: 18400,
    quantity: 211,
    initial_value_date: "2022-03-01",
    last_updated: "2026-06-01T08:00:00Z",
    is_active: true,
    created_at: "2022-03-01T00:00:00Z",
    updated_at: NOW,
  },
  // Stocks & Shares ISA - iShares S&P 500
  {
    holding_id: "demo-h-2",
    user_id: "u-br-94712",
    asset_type: "etf",
    valuation_method: "market",
    name: "iShares Core S&P 500 ETF (CSPX)",
    symbol: "CSPX",
    cost_basis: 7200,
    current_value: 9600,
    quantity: 84,
    initial_value_date: "2022-09-01",
    last_updated: "2026-06-01T08:00:00Z",
    is_active: true,
    created_at: "2022-09-01T00:00:00Z",
    updated_at: NOW,
  },
  // NEST Workplace Pension (treated as alternative/other holding)
  {
    holding_id: "demo-h-3",
    user_id: "u-br-94712",
    asset_type: "other",
    valuation_method: "manual",
    name: "NEST Workplace Pension",
    cost_basis: 18200,
    current_value: 24000,
    initial_value_date: "2022-01-01",
    last_updated: "2026-05-01T08:00:00Z",
    is_active: true,
    created_at: "2022-01-01T00:00:00Z",
    updated_at: NOW,
  },
  // Bitcoin
  {
    holding_id: "demo-h-4",
    user_id: "u-br-94712",
    asset_type: "crypto",
    valuation_method: "market",
    name: "Bitcoin (BTC)",
    symbol: "BTC",
    cost_basis: 2200,
    current_value: 3800,
    quantity: 0.038,
    initial_value_date: "2021-11-01",
    last_updated: "2026-06-01T08:00:00Z",
    is_active: true,
    created_at: "2021-11-01T00:00:00Z",
    updated_at: NOW,
  },
  // Ethereum
  {
    holding_id: "demo-h-5",
    user_id: "u-br-94712",
    asset_type: "crypto",
    valuation_method: "market",
    name: "Ethereum (ETH)",
    symbol: "ETH",
    cost_basis: 2100,
    current_value: 1900,
    quantity: 0.62,
    initial_value_date: "2022-04-01",
    last_updated: "2026-06-01T08:00:00Z",
    is_active: true,
    created_at: "2022-04-01T00:00:00Z",
    updated_at: NOW,
  },
  // Marcus savings (modelled as cash holding)
  {
    holding_id: "demo-h-6",
    user_id: "u-br-94712",
    asset_type: "cash",
    valuation_method: "manual",
    name: "Marcus Savings Account (Goldman Sachs)",
    cost_basis: 22000,
    current_value: 22000,
    coupon_rate: 4.7,
    initial_value_date: "2023-06-01",
    last_updated: "2026-06-01T08:00:00Z",
    is_active: true,
    created_at: "2023-06-01T00:00:00Z",
    updated_at: NOW,
  },
  // Barclays current account
  {
    holding_id: "demo-h-7",
    user_id: "u-br-94712",
    asset_type: "cash",
    valuation_method: "manual",
    name: "Barclays Current Account",
    cost_basis: 4800,
    current_value: 4800,
    initial_value_date: "2020-01-01",
    last_updated: "2026-06-01T08:00:00Z",
    is_active: true,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: NOW,
  },
  // Monzo savings pot
  {
    holding_id: "demo-h-8",
    user_id: "u-br-94712",
    asset_type: "cash",
    valuation_method: "manual",
    name: "Monzo Instant Savings Pot",
    cost_basis: 6200,
    current_value: 6200,
    coupon_rate: 4.1,
    initial_value_date: "2024-01-01",
    last_updated: "2026-06-01T08:00:00Z",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: NOW,
  },
  // Side business capital account
  {
    holding_id: "demo-h-9",
    user_id: "u-br-94712",
    asset_type: "other",
    valuation_method: "manual",
    name: "Side Business Working Capital",
    cost_basis: 3500,
    current_value: 5200,
    initial_value_date: "2024-01-01",
    last_updated: "2026-05-15T08:00:00Z",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: NOW,
  },
];

// ============================================================================
// PORTFOLIO PERFORMANCE HISTORY
// ============================================================================

export const DEMO_PORTFOLIO_PERFORMANCE: PerformancePoint[] = [
  { month: "2025-01", value: 68400,  contributions: 750  },
  { month: "2025-02", value: 70200,  contributions: 750  },
  { month: "2025-03", value: 72800,  contributions: 750  },
  { month: "2025-04", value: 71500,  contributions: 750  },
  { month: "2025-05", value: 74600,  contributions: 1800 },
  { month: "2025-06", value: 73200,  contributions: 750  },
  { month: "2025-07", value: 75800,  contributions: 750  },
  { month: "2025-08", value: 77400,  contributions: 750  },
  { month: "2025-09", value: 79100,  contributions: 750  },
  { month: "2025-10", value: 80600,  contributions: 750  },
  { month: "2025-11", value: 85200,  contributions: 2500 },
  { month: "2025-12", value: 83800,  contributions: 750  },
  { month: "2026-01", value: 81200,  contributions: 750  },
  { month: "2026-02", value: 84500,  contributions: 750  },
  { month: "2026-03", value: 88900,  contributions: 2000 },
  { month: "2026-04", value: 91200,  contributions: 750  },
  { month: "2026-05", value: 93800,  contributions: 750  },
  { month: "2026-06", value: 95900,  contributions: 750  },
];

// ============================================================================
// PROPERTIES
// ============================================================================

export const DEMO_PROPERTIES: Property[] = [
  {
    property_id: "demo-prop-1",
    user_id: "u-br-94712",
    name: "Family Land, Kumasi",
    property_type: "land",
    country: "Ghana",
    city: "Kumasi",
    purchase_date: "2019-08-15",
    purchase_price: 18000,
    market_value: 36500,
    mortgage_balance: 0,
    is_primary: false,
    is_active: true,
    value_uncertain: true,
    insurance: [],
    created_at: "2019-08-15T00:00:00Z",
    updated_at: NOW,
  },
  {
    property_id: "demo-prop-2",
    user_id: "u-br-94712",
    name: "Off-plan Apartment, East Legon",
    property_type: "apartment",
    country: "Ghana",
    city: "Accra",
    purchase_date: "2023-04-20",
    purchase_price: 18000,
    market_value: 24500,
    mortgage_balance: 0,
    is_primary: false,
    is_active: true,
    value_uncertain: true,
    insurance: [],
    created_at: "2023-04-20T00:00:00Z",
    updated_at: NOW,
  },
  {
    property_id: "demo-prop-3",
    user_id: "u-br-94712",
    name: "Stratford Flat, East London",
    property_type: "apartment",
    country: "United Kingdom",
    city: "London",
    purchase_date: "2021-03-10",
    purchase_price: 310000,
    market_value: 358000,
    mortgage_balance: 248000,
    is_primary: true,
    is_active: true,
    value_uncertain: false,
    insurance: [],
    created_at: "2021-03-10T00:00:00Z",
    updated_at: NOW,
  },
  {
    property_id: "demo-prop-4",
    user_id: "u-br-94712",
    name: "Holiday Villa, Faro",
    property_type: "house",
    country: "Portugal",
    city: "Faro",
    purchase_date: "2022-09-05",
    purchase_price: 195000,
    market_value: 228000,
    mortgage_balance: 142000,
    is_primary: false,
    is_active: true,
    value_uncertain: false,
    insurance: [],
    created_at: "2022-09-05T00:00:00Z",
    updated_at: NOW,
  },
  {
    property_id: "demo-prop-5",
    user_id: "u-br-94712",
    name: "Commercial Plot, Dubai South",
    property_type: "land",
    country: "United Arab Emirates",
    city: "Dubai",
    purchase_date: "2024-01-18",
    purchase_price: 72000,
    market_value: 85000,
    mortgage_balance: 0,
    is_primary: false,
    is_active: true,
    value_uncertain: true,
    insurance: [],
    created_at: "2024-01-18T00:00:00Z",
    updated_at: NOW,
  },
];

// ============================================================================
// LIABILITIES
// ============================================================================

export const DEMO_LIABILITIES: Liability[] = [
  {
    id: "demo-liab-m1",
    name: "Nationwide Mortgage - Stratford",
    lender: "Nationwide Building Society",
    type: "mortgage",
    balance: 248000,
    interestRatePct: 4.35,
    minPaymentMonthly: 1418,
    dueDay: 1,
    originalLoanAmount: 278000,
    expectedPayoffDate: "2046-03-01",
    updatedAt: NOW,
  },
  {
    id: "demo-liab-m2",
    name: "BPI Mortgage - Faro Villa",
    lender: "Banco BPI",
    type: "mortgage",
    balance: 142000,
    interestRatePct: 3.75,
    minPaymentMonthly: 852,
    dueDay: 5,
    originalLoanAmount: 165000,
    expectedPayoffDate: "2047-09-01",
    updatedAt: NOW,
  },
  {
    id: "demo-liab-1",
    name: "UK Student Loan (Plan 2)",
    lender: "Student Loans Company",
    type: "student_loan",
    balance: 24800,
    interestRatePct: 7.3,
    minPaymentMonthly: 0,
    // Plan 2 is income-contingent - repayments are auto-deducted, not a fixed min
    // Shown here for net worth visibility
    dueDay: undefined,
    originalLoanAmount: 41000,
    expectedPayoffDate: "2045-04-01",
    updatedAt: NOW,
  },
  {
    id: "demo-liab-2",
    name: "Barclays Personal Loan",
    lender: "Barclays",
    type: "personal_loan",
    balance: 3200,
    interestRatePct: 8.9,
    minPaymentMonthly: 180,
    dueDay: 15,
    originalLoanAmount: 5500,
    expectedPayoffDate: "2027-09-01",
    updatedAt: NOW,
  },
];

// ============================================================================
// INSURANCE POLICIES
// ============================================================================

export const DEMO_INSURANCE: InsurancePolicy[] = [
  {
    policy_id: "demo-ins-1",
    user_id: "u-br-94712",
    category: "life",
    provider: "Aviva",
    name: "Term Life Insurance (25-year)",
    policy_number: "AV-2023-BR-44901",
    coverage_amount: 300000,
    premium_monthly: 28,
    deductible: 0,
    start_date: "2023-03-01",
    renewal_date: "2048-03-01",
    auto_renew: false,
    beneficiary: "Sarah Richardson (spouse)",
    notes:
      "25-year level term policy. Covers mortgage deposit and income replacement. Review coverage once first home is purchased.",
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    policy_id: "demo-ins-2",
    user_id: "u-br-94712",
    category: "disability",
    provider: "Royal London",
    name: "Income Protection (50% salary)",
    policy_number: "RL-2023-IP-88214",
    coverage_amount: 34000,
    premium_monthly: 45,
    deductible: 0,
    start_date: "2023-03-01",
    renewal_date: "2027-03-01",
    auto_renew: true,
    notes:
      "Pays 50% of gross salary (£34k/year) after 13-week deferred period. Review benefit after next pay review.",
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    policy_id: "demo-ins-3",
    user_id: "u-br-94712",
    category: "health",
    provider: "Vitality Health",
    name: "Private Health Insurance",
    policy_number: "VH-2024-BR-61002",
    coverage_amount: 150000,
    premium_monthly: 82,
    deductible: 100,
    start_date: "2024-01-01",
    renewal_date: "2027-01-01",
    auto_renew: true,
    notes:
      "Comprehensive plan includes outpatient, therapies, and mental health support. Employer subsidises £30/month.",
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    policy_id: "demo-ins-4",
    user_id: "u-br-94712",
    category: "travel",
    provider: "Staysure",
    name: "Annual Multi-Trip Travel Insurance",
    policy_number: "ST-2026-AM-19023",
    coverage_amount: 10000000,
    premium_monthly: 12,
    deductible: 100,
    start_date: "2026-01-01",
    renewal_date: "2027-01-01",
    auto_renew: true,
    notes: "Covers all trips under 90 days including Ghana, US, and Europe.",
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    policy_id: "demo-ins-5",
    user_id: "u-br-94712",
    category: "home",
    provider: "Direct Line",
    name: "Home Contents Insurance",
    policy_number: "DL-2025-HC-77321",
    coverage_amount: 40000,
    premium_monthly: 16,
    deductible: 250,
    start_date: "2025-03-01",
    renewal_date: "2026-09-15",
    auto_renew: true,
    notes: "Rented flat contents. Review policy limit once we purchase property.",
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
];

// ============================================================================
// RETIREMENT CONFIG
// ============================================================================

export const DEMO_RETIREMENT: RetirementConfig = {
  currentAge: 34,
  retirementAge: 65,
  lifeExpectancy: 85,
  currentInvested: 24000, // pension balance
  monthlySavings: 530, // £283 employee + £247 employer (matched at 5%)
  existingPensionBalance: 24000,
  monthlyPensionContribution: 530,
  expectedReturnPct: 6.5,
  inflationPct: 2.5,
  safeWithdrawalRatePct: 3.5,
  desiredMonthlyIncome: 3500,
};

// ============================================================================
// LEGACY STATE
// ============================================================================

export const DEMO_LEGACY: LegacyState = {
  will: {
    status: "draft",
    lastUpdated: "2026-01-15",
    executorName: "Sarah Richardson",
    storageLocation: "Stored with Farewill (online will service)",
    notes:
      "Draft started in January 2026. Needs final review and signing. Key items: Ghana land allocation, savings distribution, guardianship for Ama.",
  } as WillInfo,
  beneficiaries: [
    {
      id: "demo-ben-1",
      name: "Sarah Richardson",
      relationship: "Spouse",
      allocationPct: 65,
      linkedAssets: ["demo-h-1", "demo-h-2", "demo-h-3", "demo-h-6"],
      contactInfo: "sarah.richardson@email.com",
    } as Beneficiary,
    {
      id: "demo-ben-2",
      name: "Ama Richardson",
      relationship: "Daughter",
      allocationPct: 25,
      linkedAssets: ["demo-goal-4"],
      contactInfo: "c/o Sarah Richardson",
    } as Beneficiary,
    {
      id: "demo-ben-3",
      name: "Abena Richardson",
      relationship: "Mother",
      allocationPct: 10,
      linkedAssets: ["demo-prop-1"],
      contactInfo: "Kumasi, Ghana",
    } as Beneficiary,
  ],
  dependents: [
    {
      id: "demo-dep-1",
      name: "Sarah Richardson",
      relationship: "Spouse",
      financialReliance: "partial",
      notes:
        "Sarah is employed as a nurse. Contributes £2,500/month to household. Would need full support if Bill were unable to work.",
    } as Dependent,
    {
      id: "demo-dep-2",
      name: "Ama Richardson",
      relationship: "Child",
      dateOfBirth: "2024-04-10",
      financialReliance: "full",
      notes: "2-year-old daughter. Currently in nursery.",
    } as Dependent,
    {
      id: "demo-dep-3",
      name: "Kofi Richardson",
      relationship: "Parent",
      financialReliance: "partial",
      notes:
        "Father in Kumasi, Ghana. Bill sends £300/month to support parents' living expenses.",
    } as Dependent,
  ],
  digitalAssets: [
    {
      id: "demo-da-1",
      name: "Coinbase Account (BTC + ETH)",
      type: "crypto",
      value: 5700,
      custodian: "Coinbase",
      accessInstructions:
        "Login credentials stored in 1Password vault. 2FA via Authenticator app on personal iPhone. Recovery phrase in sealed envelope with will documents.",
    } as DigitalAsset,
    {
      id: "demo-da-2",
      name: "Hargreaves Lansdown ISA (Stocks & Shares)",
      type: "account",
      value: 28000,
      custodian: "Hargreaves Lansdown",
      accessInstructions:
        "Online account. Login in 1Password. Paper statements sent annually.",
    } as DigitalAsset,
    {
      id: "demo-da-3",
      name: "NEST Pension Account",
      type: "account",
      value: 24000,
      custodian: "NEST",
      accessInstructions:
        "Access via nest.direct.com. Workplace pension via employer.",
    } as DigitalAsset,
    {
      id: "demo-da-4",
      name: "Side Business (BR Analytics Ltd)",
      type: "business",
      value: 5200,
      custodian: "Companies House UK",
      accessInstructions:
        "Sole director. Business banking at Monzo Business. Accountant: Taxscouts (annual filing).",
    } as DigitalAsset,
  ],
  letterOfWishes: {
    lastUpdated: "2026-01-20",
    content:
      "My primary wish is to ensure Sarah and Ama are financially secure. The family land in Kumasi should remain in the family - ideally transferred to my mother while she lives, then to Ama when she comes of age. I would like a portion of savings used to help my younger brother Kwame complete his university education if he has not done so. My ISA and pension should be used to support Sarah in maintaining our lifestyle and securing Ama's future. Please ensure that monthly support to my parents continues for at least 2 years to give them time to adjust.",
  } as LetterOfWishes,
};

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

export const DEMO_RISK_ASSESSMENT = {
  assessment_id: "demo-risk-001",
  questionnaire_version: "v2",
  result: {
    risk_band: "Moderate",
    description:
      "You are comfortable taking measured investment risk in pursuit of long-term growth, but prefer not to expose your finances to extreme volatility.",
    strategy:
      "A diversified portfolio weighted toward global equities (60-65%) with meaningful fixed income exposure (25-30%) and a small allocation to alternatives. Emerging market exposure suits your cross-border outlook.",
  },
  scoring: {
    questionnaire_score: 62,
    final_score: 58,
    time_horizon_avg: 7.5,
    modifiers: {
      age: 3,
      dependents: -4,
      debt: -2,
      emergency_fund: -1,
    },
    modifier_total: -4,
  },
  created_at: "2026-02-10T14:00:00Z",
};

// ============================================================================
// SUBSCRIPTION (full access for demo)
// ============================================================================

export const DEMO_SUBSCRIPTION = {
  subscription_status: "active",
  subscription_plan: "pro",
  trial_started_at: null,
  trial_ends_at: null,
  is_enterprise: false,
  entitlements: {
    insights_full: true,
    advisor_chat: true,
    concierge_requests: true,
    export_data: true,
    retirement_scenarios: true,
    live_market_data: true,
    portfolio_charts: true,
    cash_flow_projections: true,
    goal_scenarios: true,
  },
  record_limits: {
    goals: 20,
    assets: 50,
    properties: 10,
    liabilities: 20,
    insurance_policies: 20,
  },
};

// ============================================================================
// FULL DASHBOARD SUMMARY (shaped as DashboardSummaryData)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DEMO_DASHBOARD: any = {
  user: {
    user_id: DEMO_USER.user_id,
    first_name: DEMO_USER.first_name,
    last_name: DEMO_USER.last_name,
    display_name: DEMO_USER.display_name,
    email: DEMO_USER.email,
    phone_number: DEMO_USER.phone_number,
    resident_country: DEMO_USER.resident_country,
    city: DEMO_USER.city,
    citizenships: DEMO_USER.citizenships,
    date_of_birth: DEMO_USER.date_of_birth,
    user_type: DEMO_USER.user_type,
    currency: DEMO_USER.currency,
    preferred_contact: DEMO_USER.preferred_contact,
    is_active: DEMO_USER.is_active,
    created_at: DEMO_USER.created_at,
    updated_at: DEMO_USER.updated_at,
    occupation: DEMO_USER.occupation,
    marital_status: DEMO_USER.marital_status,
    prefix: DEMO_USER.prefix,
    gender: DEMO_USER.gender,
    account_mode: DEMO_USER.account_mode,
    risk_profile: DEMO_USER.risk_profile,
    dependents: DEMO_USER.dependents,
    bio: DEMO_USER.bio,
    ...DEMO_SUBSCRIPTION,
  },
  subscription: DEMO_SUBSCRIPTION,
  goals: DEMO_GOALS,
  incomeRows: DEMO_INCOME,
  expenseCategories: DEMO_EXPENSES,
  emergencyFund: DEMO_EMERGENCY_FUND,
  cashFlowHistory: DEMO_CASH_FLOW_HISTORY,
  cashFlowSummary: DEMO_CASH_FLOW_SUMMARY,
  holdings: DEMO_HOLDINGS,
  portfolioPerformance: DEMO_PORTFOLIO_PERFORMANCE,
  insurancePolicies: DEMO_INSURANCE,
  propertyAssets: DEMO_PROPERTIES,
  liabilities: DEMO_LIABILITIES,
  retirement: DEMO_RETIREMENT,
  riskAssessment: DEMO_RISK_ASSESSMENT,
};

// ============================================================================
// BOOT HELPER - sets all localStorage flags required to pass auth/guard checks
// ============================================================================

/**
 * Call this once on the client to plant the localStorage keys that
 * DashboardGuard, useDashboardData, and isOnboarded() read.
 * Wipes any old persisted Zustand store so the demo data always wins.
 */
export function bootDemoMode(): void {
  if (typeof window === "undefined") return;
  try {
    // Auth
    window.localStorage.setItem("auth_logged_in", "true");
    window.localStorage.setItem("auth_email", DEMO_USER.email);
    // Onboarding
    window.localStorage.setItem("onboarded_v1", "true");
    // Subscription - full Pro, active
    window.localStorage.setItem(
      "sub_data_v2",
      JSON.stringify({
        subscription_status: "active",
        subscription_plan: "pro",
        trial_started_at: null,
        trial_ends_at: null,
        is_enterprise: false,
        entitlements: {
          insights_full: true,
          advisor_chat: true,
          concierge_requests: true,
          export_data: true,
          retirement_scenarios: true,
          live_market_data: true,
          portfolio_charts: true,
          cash_flow_projections: true,
          goal_scenarios: true,
        },
        record_limits: {
          goals: 999,
          assets: 999,
          properties: 999,
          liabilities: 999,
          insurance_policies: 999,
        },
      }),
    );
    window.localStorage.setItem("sub_status", "active");
    // Wipe the persisted Zustand store so stale real-user data doesn't bleed through
    window.localStorage.removeItem("financial-store-v1");
  } catch {
    // localStorage unavailable (e.g. private browsing restrictions) - swallow
  }
}
