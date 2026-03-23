// store/financialStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  User,
  Liability,
  Property,
  AssetHolding,
  PerformancePoint,
  AllocationSlice,
  TaxProfile,
  EmergencyFundConfig,
  InsurancePolicy,
  CashFlowRow,
  ExpenseCategory,
  SectionFreshness,
  RetirementConfig,
  CashFlowPoint,
  Goal,
  FinancialDomainData,
} from "@/lib/client-data";
import { calculateAge } from "@/lib/client-data";
import type {
  IdentityData,
  GoalData,
  IncomeData,
  RetirementData,
  EmergencyFundData,
} from "@/lib/onboarding/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_TAX_PROFILE: TaxProfile = {
  effectiveTaxRatePct: 0,
  marginalTaxRatePct: 0,
  filingStatus: "single",
  updatedAt: new Date().toISOString(),
};

const DEFAULT_EMERGENCY_FUND: EmergencyFundConfig = {
  targetMonths: 6,
  currentCashBalance: 0,
  includeAccountIds: [],
  updatedAt: new Date().toISOString(),
};

const DEFAULT_RETIREMENT: RetirementConfig = {
  currentAge: 0,
  retirementAge: 0,
  lifeExpectancy: 85,
  currentInvested: 0,
  monthlySavings: 0,
  existingPensionBalance: 0,
  monthlyPensionContribution: 0,
  expectedReturnPct: 7,
  inflationPct: 2,
  safeWithdrawalRatePct: 4,
  desiredMonthlyIncome: 0,
};

// ── Seeding helper type ───────────────────────────────────────────────────────

/** Relevant slice of OnboardingState consumed by seedFromOnboarding. */
interface OnboardingSeedData {
  identity: IdentityData | null;
  goals: GoalData[];
  incomes: IncomeData[];
  retirement: RetirementData | null;
  emergencyFund: EmergencyFundData | null;
}

// ── Store shape ───────────────────────────────────────────────────────────────

interface FinancialState extends Omit<FinancialDomainData, "propertyAssets"> {
  user: User | null;
  goals: Goal[];
  /** Rich property objects — overrides the lightweight PropertyAsset[] in FinancialDomainData. */
  propertyAssets: Property[];
  /** Rich asset holdings — separate from the lightweight Account[] kept for selector compat. */
  holdings: AssetHolding[];

  setUser: (user: User | null) => void;
  setIncome: (rows: CashFlowRow[]) => void;
  setExpenses: (categories: ExpenseCategory[]) => void;
  addLiability: (liability: Liability) => void;
  removeLiability: (id: string) => void;
  setRetirement: (config: RetirementConfig) => void;
  setEmergencyFund: (config: EmergencyFundConfig) => void;
  setHoldings: (holdings: AssetHolding[]) => void;
  addProperty: (property: Property) => void;
  removeProperty: (id: string) => void;
  addInsurancePolicy: (policy: InsurancePolicy) => void;
  removeInsurancePolicy: (policyId: string) => void;
  addGoal: (goal: Goal) => void;
  removeGoal: (id: string) => void;
  seedFromOnboarding: (data: OnboardingSeedData) => void;
}

// ── Initial state ─────────────────────────────────────────────────────────────

type FinancialData = Omit<
  FinancialState,
  | "setUser"
  | "setIncome"
  | "setExpenses"
  | "addLiability"
  | "removeLiability"
  | "setRetirement"
  | "setEmergencyFund"
  | "setHoldings"
  | "addProperty"
  | "removeProperty"
  | "addInsurancePolicy"
  | "removeInsurancePolicy"
  | "addGoal"
  | "removeGoal"
  | "seedFromOnboarding"
>;

const INITIAL_STATE: FinancialData = {
  user: null,
  goals: [],
  accounts: [],
  holdings: [],
  liabilities: [],
  propertyAssets: [],
  portfolioPerformance: [],
  allocation: [],
  taxProfile: DEFAULT_TAX_PROFILE,
  emergencyFund: DEFAULT_EMERGENCY_FUND,
  insurancePolicies: [],
  incomeRows: [],
  expenseCategories: [],
  freshness: [],
  retirement: DEFAULT_RETIREMENT,
  cashFlowHistory: [],
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setUser: (user) => set({ user }),

      setIncome: (rows) => set({ incomeRows: rows }),

      setExpenses: (categories) => set({ expenseCategories: categories }),

      addLiability: (liability) =>
        set((s) => ({ liabilities: [...s.liabilities, liability] })),

      removeLiability: (id) =>
        set((s) => ({
          liabilities: s.liabilities.filter((l) => l.id !== id),
        })),

      setRetirement: (config) => set({ retirement: config }),

      setEmergencyFund: (config) => set({ emergencyFund: config }),

      setHoldings: (holdings) => set({ holdings }),

      addProperty: (property) =>
        set((s) => ({ propertyAssets: [...s.propertyAssets, property] })),

      removeProperty: (id) =>
        set((s) => ({
          propertyAssets: s.propertyAssets.filter((p) => p.property_id !== id),
        })),

      addInsurancePolicy: (policy) =>
        set((s) => ({
          insurancePolicies: [...s.insurancePolicies, policy],
        })),

      removeInsurancePolicy: (policyId) =>
        set((s) => ({
          insurancePolicies: s.insurancePolicies.filter(
            (p) => p.policy_id !== policyId,
          ),
        })),

      addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),

      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      seedFromOnboarding: ({
        identity,
        goals,
        incomes,
        retirement,
        emergencyFund,
      }) => {
        const timestamp = new Date().toISOString();

        // --- User ---
        const user: User | null = identity
          ? {
              user_id: uid(),
              email: "",
              resident_country: identity.country,
              currency: identity.preferred_currency,
              is_active: true,
              created_at: timestamp,
              updated_at: timestamp,
              user_type: "regular",
              first_name: identity.first_name,
              last_name: identity.last_name,
              display_name: identity.display_name,
              phone_number: identity.phone_number,
              city: identity.resident_city,
              date_of_birth: identity.date_of_birth,
              occupation: identity.occupation,
              marital_status: identity.marital_status as User["marital_status"],
              account_mode: identity.account_mode,
            }
          : null;

        // --- Income rows ---
        const incomeRows: CashFlowRow[] = incomes.map((inc) => ({
          id: uid(),
          name: inc.name,
          amount: Number(inc.amount_monthly) || 0,
        }));

        // --- Goals ---
        const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
        const mappedGoals: Goal[] = goals.map((g) => ({
          id: uid(),
          title: g.title,
          target: Number(g.target_amount) || 0,
          current: 0,
          yearsRemaining: Math.max(
            0,
            Math.round(
              (new Date(g.target_date).getTime() - Date.now()) / msPerYear,
            ),
          ),
          completed: false,
        }));

        // --- Retirement config ---
        let retirementConfig: RetirementConfig = { ...DEFAULT_RETIREMENT };
        if (retirement) {
          const currentAge = identity?.date_of_birth
            ? calculateAge(identity.date_of_birth)
            : 0;

          const retirementAge =
            retirement.retirement_age ??
            (retirement.retirement_target_year !== undefined
              ? retirement.retirement_target_year -
                new Date().getFullYear() +
                currentAge
              : 0);

          retirementConfig = {
            ...DEFAULT_RETIREMENT,
            currentAge,
            retirementAge: Math.max(0, retirementAge),
            monthlySavings: Number(retirement.monthly_savings) || 0,
            currentInvested: Number(retirement.current_invested) || 0,
            existingPensionBalance:
              Number(retirement.existing_pension_balance) || 0,
            monthlyPensionContribution:
              Number(retirement.employer_contribution) || 0,
            desiredMonthlyIncome:
              Number(retirement.desired_monthly_income) || 0,
          };
        }

        const emergencyFundConfig: EmergencyFundConfig = emergencyFund
          ? {
              currentCashBalance: Number(emergencyFund.cash_balance) || 0,
              targetMonths: emergencyFund.target_months,
              includeAccountIds: [],
              updatedAt: timestamp,
            }
          : DEFAULT_EMERGENCY_FUND;

        set({
          user,
          incomeRows,
          goals: mappedGoals,
          retirement: retirementConfig,
          liabilities: [],
          expenseCategories: [],
          accounts: [],
          holdings: [],
          propertyAssets: [],
          insurancePolicies: [],
          emergencyFund: emergencyFundConfig,
        });
      },
    }),
    {
      name: "financial-store-v1",
    },
  ),
);
