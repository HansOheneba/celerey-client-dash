"use client";

// components/onboarding/steps/Step5EmergencyFund.tsx
import React from "react";
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
import { ArrowRight, Lightbulb } from "lucide-react";
import { formatCurrencyAmount, getCurrencyPrefix } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

function getSavingsHeading(mode?: "solo" | "partner" | "family") {
  if (mode === "partner") return "Your household safety net";
  if (mode === "family") return "Your family’s safety net";
  return "Your safety net";
}

function getSavingsSubheading(mode?: "solo" | "partner" | "family") {
  if (mode === "partner")
    return "How much does your household currently have set aside as an emergency fund?";
  if (mode === "family")
    return "How much does your family currently have set aside as an emergency fund?";
  return "How much do you currently have set aside as an emergency fund?";
}

interface Step5EmergencyFundProps {
  defaultValues?: EmergencyFundData | null;
  onComplete: (data: EmergencyFundData) => void;
}

export function Step5EmergencyFund({
  defaultValues,
  onComplete,
}: Step5EmergencyFundProps) {
  const store = useOnboardingStore();
  const preferredCurrency = store.identity?.preferred_currency || "USD";

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
    onComplete({ cash_balance: data.cash_balance as number });
  }

  const isZero = balanceNum === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          {getSavingsHeading(store.identity?.account_mode)}
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          {getSavingsSubheading(store.identity?.account_mode)}
        </p>
      </div>

      {/* Tip card */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Advisor tip</p>
          <p className="mt-0.5 text-sm text-primary">
            Most advisors recommend holding{" "}
            <strong>3–6 months of living expenses</strong> as an emergency fund.
            This protects you from unexpected events without derailing your
            goals.
          </p>
        </div>
      </div>

      {/* Input card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Emergency fund balance
            </p>
            <p className="text-xs text-slate-500">
              Include savings accounts, cash, and liquid assets only
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cash-balance">Current balance</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {getCurrencyPrefix(preferredCurrency)}
            </span>
            <CurrencyNumberInputField
              control={control}
              name="cash_balance"
              id="cash-balance"
              placeholder="0"
              className="pl-12 text-lg h-12"
            />
          </div>
          {errors.cash_balance && (
            <p className="text-xs text-red-500">
              {errors.cash_balance.message}
            </p>
          )}
        </div>
      </div>

      {/* Contextual message */}
      {isZero && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-sm text-amber-800 font-medium">
            No emergency fund yet? That&apos;s completely fine.
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Building one is often the first goal we&apos;ll work on together.
            You&apos;re already taking the right step by tracking it.
          </p>
        </div>
      )}

      {!isZero && balanceNum > 0 && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
          <p className="text-sm text-green-800 font-medium">
            Great start; you already have a cushion!
          </p>
          <p className="text-xs text-green-700 mt-1">
            {formatCurrencyAmount(balanceNum, preferredCurrency)} saved. A
            Celerey Advisor will help you determine if this covers your target
            months of expenses.
          </p>
        </div>
      )}

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
