// store/onboardingStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  IdentityData,
  GoalData,
  IncomeData,
  LiabilityData,
  EmergencyFundData,
  RetirementData,
} from "@/lib/onboarding/types";

interface OnboardingState {
  currentStep: number;
  identity: IdentityData | null;
  goals: GoalData[];
  incomes: IncomeData[];
  liabilities: LiabilityData[];
  emergencyFund: EmergencyFundData | null;
  retirement: RetirementData | null;

  // Actions
  setStep: (step: number) => void;
  setIdentity: (data: IdentityData) => void;
  addGoal: (goal: GoalData) => void;
  removeGoal: (index: number) => void;
  setGoals: (goals: GoalData[]) => void;
  addIncome: (income: IncomeData) => void;
  removeIncome: (index: number) => void;
  setIncomes: (incomes: IncomeData[]) => void;
  addLiability: (liability: LiabilityData) => void;
  removeLiability: (index: number) => void;
  setLiabilities: (liabilities: LiabilityData[]) => void;
  setEmergencyFund: (data: EmergencyFundData) => void;
  setRetirement: (data: RetirementData) => void;
  resetOnboarding: () => void;
}

const initialState = {
  currentStep: 1,
  identity: null,
  goals: [],
  incomes: [],
  liabilities: [],
  emergencyFund: null,
  retirement: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      setIdentity: (data) => set({ identity: data }),

      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      removeGoal: (index) =>
        set((state) => ({
          goals: state.goals.filter((_, i) => i !== index),
        })),
      setGoals: (goals) => set({ goals }),

      addIncome: (income) =>
        set((state) => ({ incomes: [...state.incomes, income] })),
      removeIncome: (index) =>
        set((state) => ({
          incomes: state.incomes.filter((_, i) => i !== index),
        })),
      setIncomes: (incomes) => set({ incomes }),

      addLiability: (liability) =>
        set((state) => ({ liabilities: [...state.liabilities, liability] })),
      removeLiability: (index) =>
        set((state) => ({
          liabilities: state.liabilities.filter((_, i) => i !== index),
        })),
      setLiabilities: (liabilities) => set({ liabilities }),

      setEmergencyFund: (data) => set({ emergencyFund: data }),

      setRetirement: (data) => set({ retirement: data }),

      resetOnboarding: () => set(initialState),
    }),
    {
      name: "celerey-onboarding-v1",
    },
  ),
);
