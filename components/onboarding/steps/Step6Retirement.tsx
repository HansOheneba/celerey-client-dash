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
    <div className="space-y-10">
      {/* Header */}
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold text-slate-900 leading-tight">
          Plan your retirement
        </h1>
        <p className="mt-3 text-slate-500">
          Share a few estimates so we can project your future and guide your
          savings. You can always refine these later.
        </p>
      </div>

      {/* Section 1 */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            When and lifestyle
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Tell us when you want to retire and the income you would like to
            have
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Retirement timing */}
          <div className="space-y-2">
            <Label>Retirement target</Label>
            {isSolo ? (
              <Input
                type="number"
                min={18}
                max={100}
                placeholder="Age e.g. 60"
                {...register("retirement_age", { valueAsNumber: true })}
              />
            ) : (
              <Input
                type="number"
                min={new Date().getFullYear()}
                max={2100}
                placeholder="Year e.g. 2055"
                {...register("retirement_target_year", {
                  valueAsNumber: true,
                })}
              />
            )}
            {errors.retirement_age && (
              <p className="text-xs text-red-500">
                {errors.retirement_age.message}
              </p>
            )}
            {errors.retirement_target_year && (
              <p className="text-xs text-red-500">
                {errors.retirement_target_year.message}
              </p>
            )}
          </div>

          {/* Desired income */}
          <div className="space-y-2">
            <Label>Desired monthly income</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="desired_monthly_income"
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
      </div>

      {/* Section 2 */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Your contributions
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Let us know how much you are currently setting aside
          </p>
        </div>

        {/* Monthly savings */}
        <div className="space-y-2">
          <Label>Monthly retirement savings</Label>
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

      {/* CTA */}
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
