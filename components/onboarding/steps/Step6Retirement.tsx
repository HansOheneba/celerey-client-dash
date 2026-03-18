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
import { ArrowRight } from "lucide-react";
import { formatCurrencyAmount, getCurrencyPrefix } from "@/lib/utils";
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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RetirementFormValues>({
    resolver: zodResolver(retirementSchema) as never,
    defaultValues: {
      retirement_age: defaultValues?.retirement_age ?? 65,
      current_invested: defaultValues?.current_invested ?? 0,
      monthly_savings: defaultValues?.monthly_savings ?? 0,
      existing_pension_balance: defaultValues?.existing_pension_balance ?? 0,
      employer_contribution: defaultValues?.employer_contribution ?? 0,
      desired_monthly_income: defaultValues?.desired_monthly_income ?? 0,
    },
  });

  function onSubmit(data: RetirementFormValues) {
    onComplete({
      retirement_age: data.retirement_age as number,
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
          Answer what you can; you can give estimates. Your advisor will help
          you refine this picture.
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
        {/* Target retirement age + desired income */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="retirement-age">Target retirement age</Label>
            <Input
              id="retirement-age"
              type="number"
              min={18}
              max={100}
              {...register("retirement_age", { valueAsNumber: true })}
            />
            {errors.retirement_age && (
              <p className="text-xs text-red-500">
                {errors.retirement_age.message}
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

        {/* Current investments */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="current-invested">Current amount invested</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="current_invested"
                id="current-invested"
                placeholder="0"
                className="pl-12"
              />
            </div>
            {errors.current_invested && (
              <p className="text-xs text-red-500">
                {errors.current_invested.message}
              </p>
            )}
          </div>

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

        <div className="h-px bg-slate-100" />

        {/* Pension section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pension-balance">
              Existing pension balance{" "}
              <span className="text-slate-400 font-normal">(0 if none)</span>
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="existing_pension_balance"
                id="pension-balance"
                placeholder="0"
                className="pl-12"
              />
            </div>
            {errors.existing_pension_balance && (
              <p className="text-xs text-red-500">
                {errors.existing_pension_balance.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="employer-contribution">
              Employer contribution{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="employer_contribution"
                id="employer-contribution"
                placeholder="0"
                className="pl-12"
              />
            </div>
          </div>
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
