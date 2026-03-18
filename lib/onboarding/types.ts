// lib/onboarding/types.ts

export interface IdentityData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  country: string;
  resident_city: string;
  preferred_currency: string;
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
}

export interface RetirementData {
  retirement_age: number;
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
  liabilities: LiabilityData[];
  emergencyFund: EmergencyFundData;
  retirement: RetirementData;
}
