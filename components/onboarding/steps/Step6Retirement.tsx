"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyNumberInputField } from "@/components/ui/currency-number-input-field";
import {
  retirementSchema,
  type RetirementFormValues,
} from "@/lib/onboarding/schemas";
import type { RetirementData } from "@/lib/onboarding/types";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { getCurrencyPrefix } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

interface Step6RetirementProps {
  defaultValues?: RetirementData | null;
  onComplete: (data: RetirementData) => void;
  onBack?: () => void;
}

export function Step6Retirement({
  defaultValues,
  onComplete,
  onBack,
}: Step6RetirementProps) {
  const store = useOnboardingStore();
  const preferredCurrency = store.identity?.currency || "USD";
  const accountMode = store.accountMode;
  const isSolo = accountMode === "solo";

  // Derive current age from DOB so we can enforce a meaningful minimum
  const currentAge = React.useMemo(() => {
    const dob = store.identity?.date_of_birth;
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() >= birth.getDate());
    if (!hasBirthdayPassed) age -= 1;
    return age;
  }, [store.identity?.date_of_birth]);

  // Minimum allowed retirement age = current age + 1
  const minRetirementAge = currentAge !== null ? currentAge + 1 : 18;

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RetirementFormValues>({
    resolver: zodResolver(retirementSchema) as never,
    defaultValues: {
      retirement_age: defaultValues?.retirement_age,
      retirement_target_year: defaultValues?.retirement_target_year,
      current_invested: defaultValues?.current_invested ?? 0,
      monthly_savings: defaultValues?.monthly_savings ?? 0,
      existing_pension_balance: defaultValues?.existing_pension_balance ?? 0,
      employer_contribution: defaultValues?.employer_contribution ?? 0,
      desired_monthly_income: defaultValues?.desired_monthly_income ?? 0,
    },
  });

  // Reactively compute years until retirement for the hint label
  const watchedRetirementAge = watch("retirement_age");
  const yearsUntilRetirement = React.useMemo(() => {
    if (!isSolo || !watchedRetirementAge || currentAge === null) return null;
    const years = (watchedRetirementAge as number) - currentAge;
    return years > 0 ? years : null;
  }, [isSolo, watchedRetirementAge, currentAge]);

  function onSubmit(data: RetirementFormValues) {
    let retirement_target_year = data.retirement_target_year as
      | number
      | undefined;

    if (isSolo && data.retirement_age) {
      const dob = store.identity?.date_of_birth;
      if (dob) {
        const birthYear = new Date(dob).getFullYear();
        retirement_target_year = birthYear + (data.retirement_age as number);
      }
    }

    onComplete({
      retirement_age: isSolo ? (data.retirement_age as number) : undefined,
      retirement_target_year,
      current_invested: data.current_invested as number,
      monthly_savings: data.monthly_savings as number,
      existing_pension_balance: data.existing_pension_balance as number,
      employer_contribution:
        (data.employer_contribution as number | undefined) ?? undefined,
      desired_monthly_income: data.desired_monthly_income as number,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          Plan your retirement
        </h1>
        <p className="mt-1.5 text-slate-500 text-sm">
          A few estimates help us project your future. You can refine these
          anytime.
        </p>
      </div>

      {/* ── Section 1: When & Lifestyle ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          When &amp; lifestyle
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Retirement timing */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">
              {isSolo ? "Target retirement age" : "Target retirement year"}
            </Label>
            {isSolo ? (
              <>
                <Input
                  type="number"
                  min={minRetirementAge}
                  max={100}
                  placeholder="e.g. 60"
                  {...register("retirement_age", {
                    valueAsNumber: true,
                    validate: (v) => {
                      const n = v as number | undefined;
                      if (!n || isNaN(n)) return true;
                      if (currentAge !== null && n <= currentAge)
                        return `Must be greater than your current age (${currentAge})`;
                      return true;
                    },
                  })}
                />
                {yearsUntilRetirement !== null && (
                  <p className="text-[11px] text-slate-400">
                    That&apos;s in{" "}
                    <span className="font-medium text-slate-600">
                      {yearsUntilRetirement} year
                      {yearsUntilRetirement !== 1 ? "s" : ""}
                    </span>
                  </p>
                )}
              </>
            ) : (
              <Input
                type="number"
                min={new Date().getFullYear()}
                max={2100}
                placeholder="e.g. 2055"
                {...register("retirement_target_year", { valueAsNumber: true })}
              />
            )}
            {(errors.retirement_age || errors.retirement_target_year) && (
              <p className="text-xs text-red-500">
                {errors.retirement_age?.message ??
                  errors.retirement_target_year?.message}
              </p>
            )}
          </div>

          {/* Desired income */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">
              Desired monthly income
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="desired_monthly_income"
                placeholder="3 000"
                className="pl-12"
              />
            </div>
            {errors.desired_monthly_income && (
              <p className="text-xs text-red-500">
                {errors.desired_monthly_income.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Contributions ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Your contributions
        </p>

        {/* Monthly savings — full width, feels primary */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">
            Monthly retirement savings
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {getCurrencyPrefix(preferredCurrency)}
            </span>
            <CurrencyNumberInputField
              control={control}
              name="monthly_savings"
              placeholder="500"
              className="pl-12"
            />
          </div>
          {errors.monthly_savings && (
            <p className="text-xs text-red-500">
              {errors.monthly_savings.message}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 gap-1 h-11 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="flex-1 gap-2 bg-[#151339] hover:bg-[#1e1b55] text-white h-11 rounded-xl"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
