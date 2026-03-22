"use client";

// components/onboarding/steps/Step6Retirement.tsx
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
import { ONBOARDING_COPY } from "@/lib/onboarding/copy";
import { ArrowRight } from "lucide-react";
import { getCurrencyPrefix } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

interface Step6RetirementProps {
  defaultValues?: RetirementData | null;
  onComplete: (data: RetirementData) => void;
}

export function Step6Retirement({
  defaultValues,
  onComplete,
}: Step6RetirementProps) {
  const store = useOnboardingStore();
  const preferredCurrency = store.identity?.preferred_currency || "USD";
  const accountMode = store.accountMode;
  const isSolo = accountMode === "solo";

  const retirementFieldLabel =
    ONBOARDING_COPY.retirement.fieldLabel[accountMode];
  const retirementFieldPlaceholder =
    ONBOARDING_COPY.retirement.fieldPlaceholder[accountMode];

  const {
    register,
    control,
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

  function onSubmit(data: RetirementFormValues) {
    let retirement_target_year = data.retirement_target_year as
      | number
      | undefined;

    // For solo: derive retirement_target_year from DOB + retirement_age
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          Let&apos;s think about your future
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          Just three quick numbers — you can fill in the rest from your
          dashboard later.
        </p>
      </div>

      {/* Icon */}
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Retirement planning
          </p>
          <p className="text-xs text-slate-500">
            Even rough numbers give us a powerful starting point
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        {/* Retirement timeline field + desired income */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="retirement-target">{retirementFieldLabel}</Label>
            {isSolo ? (
              <Input
                id="retirement-target"
                type="number"
                min={18}
                max={100}
                placeholder={"eg: 60"}
                {...register("retirement_age", { valueAsNumber: true })}
              />
            ) : (
              <Input
                id="retirement-target"
                type="number"
                min={new Date().getFullYear()}
                max={2100}
                placeholder={retirementFieldPlaceholder}
                {...register("retirement_target_year", { valueAsNumber: true })}
              />
            )}
            {isSolo && errors.retirement_age && (
              <p className="text-xs text-red-500">
                {errors.retirement_age.message}
              </p>
            )}
            {!isSolo && errors.retirement_target_year && (
              <p className="text-xs text-red-500">
                {errors.retirement_target_year.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desired-income">
              Desired monthly income in retirement
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="desired_monthly_income"
                id="desired-income"
                placeholder="3000"
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

        <div className="h-px bg-slate-100" />

        {/* Monthly savings */}
        <div className="space-y-1.5">
          <Label htmlFor="monthly-savings">Monthly retirement savings</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {getCurrencyPrefix(preferredCurrency)}
            </span>
            <CurrencyNumberInputField
              control={control}
              name="monthly_savings"
              id="monthly-savings"
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

      <Button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="w-full gap-2 bg-[#151339] hover:bg-[#1e1b55] text-white h-12 text-base rounded-xl"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
