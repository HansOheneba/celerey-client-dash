"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboardingStore";
import { submitOnboarding, TokenExpiredError } from "@/lib/onboarding/api";
import type { OnboardingPayload } from "@/lib/onboarding/types";
import {
  setOnboarded,
  setUserProfile,
  type UserProfile,
} from "@/lib/client-data";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Target,
  Banknote,
  Shield,
  Sunset,
  Loader2,
} from "lucide-react";
import { formatCurrencyAmount } from "@/lib/utils";

interface Step7ReviewProps {
  onComplete: () => void;
  onEditStep: (step: number) => void;
  onBack?: () => void;
  email: string;
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
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-slate-200 transition-colors">
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
        className="ml-3 shrink-0 flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 transition-colors"
      >
        Edit <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

export function Step7Review({
  onComplete,
  onEditStep,
  onBack,
  email,
}: Step7ReviewProps) {
  const store = useOnboardingStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  const { identity, goals, incomes, emergencyFund, retirement } = store;

  async function handleSubmit() {
    if (!identity || !emergencyFund || !retirement) {
      setSubmitError(
        "Some details are missing. Please review your steps before continuing.",
      );
      return;
    }

    const payload: OnboardingPayload = {
      identity: {
        ...identity,
        email, // injected from auth state
      },
      goals,
      incomes,
      emergencyFund,
      retirement,
    };

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await submitOnboarding(payload);

      // Persist the created user profile for use throughout the dashboard.
      const user = result.data.user;
      setUserProfile({
        user_id: user.user_id,
        account_mode: user.account_mode,
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        resident_country: user.resident_country,
        resident_city: user.resident_city,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        currency: user.currency,
        prefix: user.prefix,
        occupation: user.occupation,
        marital_status: user.marital_status,
        user_type: user.user_type,
        is_active: user.is_active,
      } satisfies UserProfile);

      setOnboarded();
      onComplete();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        setSessionExpired(true);
        setSubmitError("");
      } else {
        setSubmitError(
          "Something went wrong. Please try again. Your progress is saved.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount_monthly), 0);
  const preferredCurrency = identity?.currency || "USD";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold text-slate-900 leading-tight">
          Review and finish setup
        </h1>
        <p className="mt-3 text-slate-500">
          Take a moment to check your details. You can edit anything before
          completing your setup.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <SectionCard
          icon={<User className="h-5 w-5 text-primary" />}
          title="Your profile"
          summary={
            identity
              ? `${identity.display_name ?? [identity.first_name, identity.last_name].filter(Boolean).join(" ")} · ${identity.resident_country} · ${identity.currency}`
              : "Not completed"
          }
          step={2}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Target className="h-5 w-5 text-primary" />}
          title="Your goals"
          summary={
            goals.length > 0
              ? `${goals.length} goal${goals.length > 1 ? "s" : ""} · ${goals.map((g) => g.title).join(", ")}`
              : "No goals added"
          }
          step={3}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Banknote className="h-5 w-5 text-primary" />}
          title="Your income"
          summary={
            incomes.length > 0
              ? `${incomes.length} source${incomes.length > 1 ? "s" : ""} · ${formatCurrencyAmount(totalIncome, preferredCurrency)} this month`
              : "No income added"
          }
          step={4}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Shield className="h-5 w-5 text-primary" />}
          title="Emergency fund"
          summary={
            emergencyFund != null
              ? `${formatCurrencyAmount(
                  emergencyFund.cash_balance,
                  preferredCurrency,
                )} saved`
              : "Not completed"
          }
          step={6}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Sunset className="h-5 w-5 text-primary" />}
          title="Retirement plan"
          summary={
            retirement
              ? retirement.retirement_target_year
                ? `Target year ${retirement.retirement_target_year} · ${formatCurrencyAmount(retirement.desired_monthly_income, preferredCurrency)} per month`
                : `Target age ${retirement.retirement_age} · ${formatCurrencyAmount(retirement.desired_monthly_income, preferredCurrency)} per month`
              : "Not completed"
          }
          step={7}
          onEdit={onEditStep}
        />
      </div>

      {/* Next step box */}
      <div className="rounded-2xl border border-slate-100 bg-primary p-6 text-white">
        <p className="text-xs font-semibold tracking-widest text-white/60 uppercase mb-3">
          Next step
        </p>

        <p className="text-sm text-white/90 leading-relaxed">
          Once you complete setup, your dashboard will be ready. You will be
          able to track your finances, see your net worth, and follow a clear
          plan based on your goals.
        </p>
      </div>

      {sessionExpired && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">
            Your onboarding session has expired
          </p>

          <p className="text-sm text-amber-700 leading-relaxed">
            Your onboarding session expired while you were away, for security reasons. Your progress is saved,
            reverify your email to continue.
          </p>

          <Button
            type="button"
            className="h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm px-4"
            onClick={() => router.push("/")}
          >
            Restart onboarding →
          </Button>
        </div>
      )}

      {submitError && (
        <p className="text-sm text-red-600 font-medium rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          {submitError}
        </p>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 gap-1 h-12 text-base rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 gap-2 bg-primary hover:bg-[#1e1b55] text-white h-12 text-base rounded-xl disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up your dashboard
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Complete setup
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
