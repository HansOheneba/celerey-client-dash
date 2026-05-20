// app/onboarding/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useClientGate } from "../../lib/useClientGate";
import { setOnboarded, isOnboarded } from "../../lib/client-data";
import { CelereyLoader } from "@/components/login/celerey-loader";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Step0AccountMode } from "@/components/onboarding/steps/Step0AccountMode";
import { Step1Identity } from "@/components/onboarding/steps/Step1Identity";
import { Step2Goals } from "@/components/onboarding/steps/Step2Goals";
import { Step3Income } from "@/components/onboarding/steps/Step3Income";
import { Step5EmergencyFund } from "@/components/onboarding/steps/Step5EmergencyFund";
import { Step6Retirement } from "@/components/onboarding/steps/Step6Retirement";
import { Step7Review } from "@/components/onboarding/steps/Step7Review";
import { Step8Complete } from "@/components/onboarding/steps/Step8Complete";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useFinancialStore } from "@/store/financialStore";
import type {
  IdentityData,
  GoalData,
  IncomeData,
  EmergencyFundData,
  RetirementData,
} from "@/lib/onboarding/types";
import type { AccountMode } from "@/lib/onboarding/copy";

// Step layout (1-indexed):
//   1  → Account Mode selection  (Step0AccountMode)
//   2  → Identity                (Step1Identity)
//   3  → Goals                   (Step2Goals)
//   4  → Income                  (Step3Income)
//   5  → Emergency Fund          (Step5EmergencyFund)
//   6  → Retirement              (Step6Retirement)
//   7  → Review                  (Step7Review)
//   8  → Complete                (Step8Complete — bypasses shell)
const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, auth } = useClientGate();

  const store = useOnboardingStore();
  const seedFromOnboarding = useFinancialStore((s) => s.seedFromOnboarding);
  const setUser = useFinancialStore((s) => s.setUser);
  const {
    currentStep,
    accountMode,
    identity,
    goals,
    incomes,
    emergencyFund,
    retirement,
    setStep,
    setAccountMode,
    setIdentity,
    setGoals,
    setIncomes,
    setEmergencyFund,
    setRetirement,
    resetOnboarding,
  } = store;

  // Redirect if not authenticated
  useEffect(() => {
    if (!ready) return;
    if (!auth.loggedIn) {
      router.replace("/");
      return;
    }
    // If already onboarded, go straight to dashboard
    if (isOnboarded()) {
      router.replace("/dashboard");
    }
  }, [ready, auth, router]);

  function handleBack() {
    if (currentStep > 1) setStep(currentStep - 1);
  }

  // Step handlers
  function handleStep1(mode: AccountMode) {
    setAccountMode(mode);
    setStep(2);
  }

  function handleStep2(data: IdentityData) {
    setIdentity(data);
    setStep(3);
  }

  function handleStep3(data: GoalData[]) {
    setGoals(data);
    setStep(4);
  }

  function handleStep4(data: IncomeData[]) {
    setIncomes(data);
    setStep(5);
  }

  function handleStep5(data: EmergencyFundData) {
    setEmergencyFund(data);
    setStep(6);
  }

  function handleStep6(data: RetirementData) {
    setRetirement(data);
    setStep(7);
  }

  function handleStep7Complete() {
    // Seed the financial store from onboarding data before marking complete
    if (identity) {
      seedFromOnboarding({
        identity,
        goals,
        incomes,
        retirement,
        emergencyFund,
      });

      // Patch the email (set at login) into the seeded user
      const email = auth.email ?? "";
      if (email) {
        const seededUser = useFinancialStore.getState().user;
        if (seededUser) {
          setUser({ ...seededUser, email });
        }
      }
    }
    setOnboarded();
    setStep(8);
  }

  if (!ready) return <CelereyLoader />;

  const totalIncome = incomes
    .filter((i) => i.is_recurring)
    .reduce((s, i) => s + Number(i.amount_monthly), 0);

  // display_name is the single source of truth for names across all account modes
  const displayName = identity?.display_name ?? "there";

  return (
    <OnboardingShell currentStep={currentStep} totalSteps={TOTAL_STEPS}>
      {currentStep === 1 && (
        <Step0AccountMode defaultValue={accountMode} onComplete={handleStep1} />
      )}
      {currentStep === 2 && (
        <Step1Identity
          defaultValues={identity}
          onComplete={handleStep2}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <Step2Goals
          defaultValues={goals}
          onComplete={handleStep3}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <Step3Income
          defaultValues={incomes}
          onComplete={handleStep4}
          onBack={handleBack}
        />
      )}
      {currentStep === 5 && (
        <Step5EmergencyFund
          defaultValues={emergencyFund}
          onComplete={handleStep5}
          onBack={handleBack}
        />
      )}
      {currentStep === 6 && (
        <Step6Retirement
          defaultValues={retirement}
          onComplete={handleStep6}
          onBack={handleBack}
        />
      )}
      {currentStep === 7 && (
        <Step7Review
          onComplete={handleStep7Complete}
          onEditStep={(step) => setStep(step)}
          onBack={handleBack}
          email={auth.email ?? ""}
        />
      )}
      {currentStep === 8 && (
        <Step8Complete
          displayName={displayName}
          goalCount={goals.length}
          totalIncome={totalIncome}
        />
      )}
    </OnboardingShell>
  );
}
