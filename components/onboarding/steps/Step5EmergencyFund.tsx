"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyNumberInputField } from "@/components/ui/currency-number-input-field";
import {
  emergencyFundSchema,
  type EmergencyFundFormValues,
} from "@/lib/onboarding/schemas";
import type { EmergencyFundData } from "@/lib/onboarding/types";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { formatCurrencyAmount, getCurrencyPrefix } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

interface Step5EmergencyFundProps {
  defaultValues?: EmergencyFundData | null;
  totalMonthlyExpenses?: number;
  onComplete: (data: EmergencyFundData) => void;
  onBack?: () => void;
}

export function Step5EmergencyFund({
  defaultValues,
  totalMonthlyExpenses = 0,
  onComplete,
  onBack,
}: Step5EmergencyFundProps) {
  const store = useOnboardingStore();
  const preferredCurrency = store.identity?.currency || "USD";

  const [targetMonths, setTargetMonths] = useState<number>(
    defaultValues?.target_months ?? 6,
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmergencyFundFormValues>({
    resolver: zodResolver(emergencyFundSchema) as never,
    defaultValues: {
      cash_balance: defaultValues?.cash_balance ?? 0,
    },
  });

  const balance = watch("cash_balance");
  const balanceNum = Number(balance) || 0;

  function onSubmit(data: EmergencyFundFormValues) {
    onComplete({
      cash_balance: data.cash_balance as number,
      target_months: targetMonths,
    });
  }

  const isZero = balanceNum === 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          Your emergency fund
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          If your income stopped today, how long could you cover your expenses?
          That is your runway.
        </p>
      </div>

      {/* Coverage */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-800">
            Based on your expenses, how many months could you survive if your
            income stopped today?
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Most advisors recommend 3 to 6 months as a minimum buffer.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[3, 6, 9, 12].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTargetMonths(m)}
              className={`rounded-xl border py-2.5 text-xs sm:text-sm font-medium text-center ${
                targetMonths === m
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-primary/50"
              }`}
            >
              {m} months
            </button>
          ))}
        </div>

        {totalMonthlyExpenses > 0 && (
          <p className="text-xs text-slate-500">
            At {formatCurrencyAmount(totalMonthlyExpenses, preferredCurrency)}
            /mo in expenses, a {targetMonths}-month fund means{" "}
            <span className="font-semibold text-slate-700">
              {formatCurrencyAmount(
                totalMonthlyExpenses * targetMonths,
                preferredCurrency,
              )}
            </span>{" "}
            saved.
          </p>
        )}
      </div>

      {/* Input */}
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-800">
          How much do you have saved right now?
        </p>

        <div className="space-y-2">
          <Label>Current emergency fund</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {getCurrencyPrefix(preferredCurrency)}
            </span>
            <CurrencyNumberInputField
              control={control}
              name="cash_balance"
              placeholder="0"
              className="pl-12 h-12 text-lg"
            />
          </div>
          {errors.cash_balance && (
            <p className="text-xs text-red-500">
              {errors.cash_balance.message}
            </p>
          )}
        </div>
      </div>

      {/* Feedback */}
      {isZero ? (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-sm text-amber-800 font-medium">
            No emergency fund yet? That is okay.
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Building one is usually the first step. We will help you get there.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
          <p className="text-sm text-green-800 font-medium">
            Good start - you already have a buffer.
          </p>
          <p className="text-xs text-green-700 mt-1">
            {formatCurrencyAmount(balanceNum, preferredCurrency)} saved so far.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 gap-1 h-12 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="flex-1 gap-2 h-12 bg-[#151339] hover:bg-[#1e1b55] text-white rounded-xl"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
