// lib/onboarding/types.ts

export interface IdentityData {
  /** Nullable — only collected for solo accounts */
  first_name?: string;
  /** Nullable — only collected for solo accounts */
  last_name?: string;
  /**
   * Single display name used everywhere in the UI.
   * For solo accounts: derived as `first_name + last_name`.
   * For partner/family accounts: entered directly as the household name.
   */
  display_name?: string;
  /** Nullable — only collected for solo accounts */
  date_of_birth?: string;
  phone_number: string;
  country: string;
  resident_city: string;
  preferred_currency: string;
  account_mode: "solo" | "partner" | "family";
  marital_status?: string;
  occupation?: string;
}

export interface GoalData {
  title: string;
  target_amount: number;
  target_date: string;
  status: "active";
}

export interface IncomeData {
  name: string;
  amount_monthly: number;
  category: string;
  is_recurring: boolean;
}

export interface LiabilityData {
  name: string;
  liability_type: string;
  balance: number;
  interest_rate_pct: number;
  minimum_payment_monthly: number;
  due_date?: string;
}

export interface EmergencyFundData {
  cash_balance: number;
  target_months: number;
}

export interface RetirementData {
  /**
   * Collected for solo accounts.
   * retirement_target_year is derived from DOB + retirement_age for solo.
   */
  retirement_age?: number;
  /**
   * Single source of truth for retirement timeline across all account types.
   * For solo: derived as birth_year + retirement_age.
   * For partner/family: entered directly.
   */
  retirement_target_year?: number;
  current_invested: number;
  monthly_savings: number;
  existing_pension_balance: number;
  employer_contribution?: number;
  desired_monthly_income: number;
}

export interface OnboardingPayload {
  identity: IdentityData;
  goals: GoalData[];
  incomes: IncomeData[];
  liabilities?: LiabilityData[];
  emergencyFund: EmergencyFundData;
  retirement: RetirementData;
}
