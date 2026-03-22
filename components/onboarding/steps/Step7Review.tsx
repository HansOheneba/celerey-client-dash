"use client";

// components/onboarding/steps/Step7Review.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboardingStore";
import { submitOnboarding } from "@/lib/onboarding/api";
import type { OnboardingPayload } from "@/lib/onboarding/types";
import {
  CheckCircle2,
  ChevronRight,
  User,
  Target,
  Banknote,
  CreditCard,
  Shield,
  Sunset,
  Loader2,
} from "lucide-react";
import { formatCurrencyAmount } from "@/lib/utils";

interface Step7ReviewProps {
  onComplete: () => void;
  onEditStep: (step: number) => void;
}

function SectionCard({
  icon,
  title,
  summary,
  step,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  summary: string | React.ReactNode;
  step: number;
  onEdit: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {summary}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="ml-3 shrink-0 flex items-center gap-1 text-xs font-medium text-indigo-800 hover:underline transition-colors"
      >
        Edit <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

export function Step7Review({ onComplete, onEditStep }: Step7ReviewProps) {
  const store = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { identity, goals, incomes, liabilities, emergencyFund, retirement } =
    store;

  async function handleSubmit() {
    if (!identity || !emergencyFund || !retirement) {
      setSubmitError(
        "Some required data is missing. Please go back and complete all steps.",
      );
      return;
    }

    const payload: OnboardingPayload = {
      identity,
      goals,
      incomes,
      liabilities,
      emergencyFund,
      retirement,
    };

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitOnboarding(payload);
      onComplete();
    } catch {
      setSubmitError(
        "Something went wrong. Please try again — your progress is saved.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount_monthly), 0);
  const totalDebt = liabilities.reduce((s, l) => s + Number(l.balance), 0);
  const preferredCurrency = identity?.preferred_currency || "USD";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          Almost there... <br />{" "}
          <span className="text-sm font-normal">let&apos;s review</span>
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          Here&apos;s everything you&apos;ve shared. Click any section to edit
          before we set up your dashboard.
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        <SectionCard
          icon={<User className="h-5 w-5 text-primary" />}
          title="Identity"
          summary={
            identity
              ? `${identity.display_name ?? [identity.first_name, identity.last_name].filter(Boolean).join(" ")} · ${identity.country} · ${identity.preferred_currency}`
              : "Not completed"
          }
          // step 2 = Identity in the new 1-indexed flow (1 = AccountMode)
          step={2}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Target className="h-5 w-5 text-primary" />}
          title="Goals"
          summary={
            goals.length > 0
              ? `${goals.length} goal${goals.length > 1 ? "s" : ""} — ${goals.map((g) => g.title).join(", ")}`
              : "No goals added"
          }
          step={3}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Banknote className="h-5 w-5 text-primary" />}
          title="Income"
          summary={
            incomes.length > 0
              ? `${incomes.length} source${incomes.length > 1 ? "s" : ""} · ${formatCurrencyAmount(totalIncome, preferredCurrency)}/mo total`
              : "No income added"
          }
          step={4}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<CreditCard className="h-5 w-5 text-primary" />}
          title="Debts & Liabilities"
          summary={
            liabilities.length > 0
              ? `${liabilities.length} debt${liabilities.length > 1 ? "s" : ""} · ${formatCurrencyAmount(totalDebt, preferredCurrency)} total`
              : "No debts — great going!"
          }
          step={5}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Shield className="h-5 w-5 text-primary" />}
          title="Emergency Fund"
          summary={
            emergencyFund != null
              ? formatCurrencyAmount(
                  emergencyFund.cash_balance,
                  preferredCurrency,
                ) + " saved"
              : "Not completed"
          }
          step={6}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Sunset className="h-5 w-5 text-primary" />}
          title="Retirement"
          summary={
            retirement
              ? retirement.retirement_target_year
                ? `Target year ${retirement.retirement_target_year} · ${formatCurrencyAmount(retirement.desired_monthly_income, preferredCurrency)}/mo desired`
                : `Target age ${retirement.retirement_age} · ${formatCurrencyAmount(retirement.desired_monthly_income, preferredCurrency)}/mo desired`
              : "Not completed"
          }
          step={7}
          onEdit={onEditStep}
        />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-primary p-5 text-white">
        <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-3">
          What happens next
        </p>

        <div className="space-y-4">
          <p className="text-sm text-white/90 leading-relaxed">
            We’re about to set up your dashboard using everything you’ve shared.
            Once you’re in, you’ll be able to see your net worth, track your
            finances, and get a clearer picture of where you stand.
          </p>
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-600 font-medium rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          {submitError}
        </p>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full gap-2 bg-[#151339] hover:bg-[#1e1b55] text-white h-12 text-base rounded-xl disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Setting up your dashboard…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Complete Setup
          </>
        )}
      </Button>
    </div>
  );
}
