// app/onboarding/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useClientGate } from "../../lib/useClientGate";
import { setOnboarded, isOnboarded } from "../../lib/client-data";
import { CelereyLoader } from "@/components/login/celerey-loader";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Step1Identity } from "@/components/onboarding/steps/Step1Identity";
import { Step2Goals } from "@/components/onboarding/steps/Step2Goals";
import { Step3Income } from "@/components/onboarding/steps/Step3Income";
import { Step4Liabilities } from "@/components/onboarding/steps/Step4Liabilities";
import { Step5EmergencyFund } from "@/components/onboarding/steps/Step5EmergencyFund";
import { Step6Retirement } from "@/components/onboarding/steps/Step6Retirement";
import { Step7Review } from "@/components/onboarding/steps/Step7Review";
import { Step8Complete } from "@/components/onboarding/steps/Step8Complete";
import { useOnboardingStore } from "@/store/onboardingStore";
import type {
  IdentityData,
  GoalData,
  IncomeData,
  LiabilityData,
  EmergencyFundData,
  RetirementData,
} from "@/lib/onboarding/types";

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, auth } = useClientGate();

  const store = useOnboardingStore();
  const {
    currentStep,
    identity,
    goals,
    incomes,
    liabilities,
    emergencyFund,
    retirement,
    setStep,
    setIdentity,
    setGoals,
    setIncomes,
    setLiabilities,
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
    // If already onboarded, skip to choose-plan or dashboard
    if (isOnboarded()) {
      router.replace("/dashboard");
    }
  }, [ready, auth, router]);

  function handleBack() {
    if (currentStep > 1) setStep(currentStep - 1);
  }

  // Step handlers
  function handleStep1(data: IdentityData) {
    setIdentity(data);
    setStep(2);
  }

  function handleStep2(data: GoalData[]) {
    setGoals(data);
    setStep(3);
  }

  function handleStep3(data: IncomeData[]) {
    setIncomes(data);
    setStep(4);
  }

  function handleStep4(data: LiabilityData[]) {
    setLiabilities(data);
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
    setOnboarded();
    setStep(8);
  }

  if (!ready) return <CelereyLoader />;

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount_monthly), 0);
  const totalAssets =
    Number(emergencyFund?.cash_balance ?? 0) +
    Number(retirement?.current_invested ?? 0);

  return (
    <OnboardingShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onBack={handleBack}
      showBack={currentStep > 1 && currentStep < 8}
    >
      {currentStep === 1 && (
        <Step1Identity defaultValues={identity} onComplete={handleStep1} />
      )}
      {currentStep === 2 && (
        <Step2Goals defaultValues={goals} onComplete={handleStep2} />
      )}
      {currentStep === 3 && (
        <Step3Income defaultValues={incomes} onComplete={handleStep3} />
      )}
      {currentStep === 4 && (
        <Step4Liabilities
          defaultValues={liabilities}
          onComplete={handleStep4}
        />
      )}
      {currentStep === 5 && (
        <Step5EmergencyFund
          defaultValues={emergencyFund}
          onComplete={handleStep5}
        />
      )}
      {currentStep === 6 && (
        <Step6Retirement defaultValues={retirement} onComplete={handleStep6} />
      )}
      {currentStep === 7 && (
        <Step7Review
          onComplete={handleStep7Complete}
          onEditStep={(step) => setStep(step)}
        />
      )}
      {currentStep === 8 && (
        <Step8Complete
          firstName={identity?.first_name ?? "there"}
          goalCount={goals.length}
          totalIncome={totalIncome}
        />
      )}
    </OnboardingShell>
  );
}
