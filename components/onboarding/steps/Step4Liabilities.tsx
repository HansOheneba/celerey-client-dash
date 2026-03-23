"use client";

// components/onboarding/steps/Step4Liabilities.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyNumberInputField } from "@/components/ui/currency-number-input-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  liabilitySchema,
  type LiabilityFormValues,
} from "@/lib/onboarding/schemas";
import type { LiabilityData } from "@/lib/onboarding/types";
import {
  ArrowRight,
  Trash2,
  Plus,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import { formatCurrencyAmount, getCurrencyPrefix } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

const LIABILITY_TYPES = [
  "Mortgage",
  "Car Loan",
  "Student Loan",
  "Credit Card",
  "Personal Loan",
  "Business Loan",
  "Medical Debt",
  "Other",
];

function getExpenseHeading(mode?: "solo" | "partner" | "family") {
  if (mode === "partner")
    return "Combined, what are your monthly household expenses?";
  if (mode === "family")
    return "What are your total monthly household expenses across everyone?";
  return "What are your monthly expenses?";
}

function getExpenseSubheading(mode?: "solo" | "partner" | "family") {
  if (mode === "partner")
    return "List household debts and recurring payments your partner contributes to.";
  if (mode === "family")
    return "List family debts and recurring payments that affect your household budget.";
  return "No judgment here; knowing your debts is the first step to clearing them.";
}

interface Step4LiabilitiesProps {
  defaultValues?: LiabilityData[];
  onComplete: (liabilities: LiabilityData[]) => void;
  onBack?: () => void;
}

export function Step4Liabilities({
  defaultValues = [],
  onComplete,
  onBack,
}: Step4LiabilitiesProps) {
  const [liabilities, setLiabilities] =
    useState<LiabilityData[]>(defaultValues);
  const store = useOnboardingStore();
  const preferredCurrency = store.identity?.preferred_currency || "USD";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<LiabilityFormValues>({
    resolver: zodResolver(liabilitySchema) as never,
    defaultValues: {
      name: "",
      liability_type: "",
      balance: 0,
      interest_rate_pct: 0,
      minimum_payment_monthly: 0,
      due_date: "",
    },
  });

  function addLiability(data: LiabilityFormValues) {
    setLiabilities((prev) => [
      ...prev,
      {
        ...data,
        balance: data.balance as number,
        interest_rate_pct: data.interest_rate_pct as number,
        minimum_payment_monthly: data.minimum_payment_monthly as number,
        due_date: data.due_date || undefined,
      },
    ]);
    reset({
      name: "",
      liability_type: "",
      balance: 0,
      interest_rate_pct: 0,
      minimum_payment_monthly: 0,
      due_date: "",
    });
  }

  function removeLiability(i: number) {
    setLiabilities((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSkip() {
    onComplete([]);
  }

  function handleNext() {
    onComplete(liabilities);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          {getExpenseHeading(store.identity?.account_mode)}
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          {getExpenseSubheading(store.identity?.account_mode)}
          <br />
          You can always skip this and add debts later.
        </p>
      </div>

      {/* Entry form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Add a debt
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="liability-name">Name</Label>
            <Input
              id="liability-name"
              placeholder="e.g. HSBC Mortgage"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select onValueChange={(v) => setValue("liability_type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {LIABILITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.liability_type && (
              <p className="text-xs text-red-500">
                {errors.liability_type.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="liability-balance">Outstanding balance</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="balance"
                id="liability-balance"
                placeholder="25000"
                className="pl-12"
              />
            </div>
            {errors.balance && (
              <p className="text-xs text-red-500">{errors.balance.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interest-rate">Interest rate (%)</Label>
            <div className="relative">
              <Input
                id="interest-rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="5.5"
                className="pr-7"
                {...register("interest_rate_pct", { valueAsNumber: true })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                %
              </span>
            </div>
            {errors.interest_rate_pct && (
              <p className="text-xs text-red-500">
                {errors.interest_rate_pct.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="min-payment">Min. monthly payment</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="minimum_payment_monthly"
                id="min-payment"
                placeholder="250"
                className="pl-12"
              />
            </div>
            {errors.minimum_payment_monthly && (
              <p className="text-xs text-red-500">
                {errors.minimum_payment_monthly.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="due-date">
              Due date{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input id="due-date" type="date" {...register("due_date")} />
          </div>
        </div>

        <div className="flex items-end justify-end">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-dashed border-slate-300 text-slate-600 hover:border-[#151339] hover:text-[#151339]"
            onClick={handleSubmit(addLiability)}
          >
            <Plus className="h-4 w-4" />
            Add debt
          </Button>
        </div>
      </div>

      {/* Liabilities list */}
      {liabilities.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Debts added ({liabilities.length})
          </p>
          {liabilities.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{l.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatCurrencyAmount(l.balance, preferredCurrency)} ·{" "}
                    {l.interest_rate_pct}% · {l.liability_type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeLiability(i)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-600">
              Total debt
            </span>
            <span className="text-base font-semibold text-slate-900">
              {formatCurrencyAmount(
                liabilities.reduce((s, l) => s + Number(l.balance), 0),
                preferredCurrency,
              )}
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
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
            onClick={handleNext}
            className="flex-1 gap-2 bg-[#151339] hover:bg-[#1e1b55] text-white h-12 text-base rounded-xl"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {liabilities.length === 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-slate-500 hover:text-slate-800"
          >
            I have no debts, skip this step
          </Button>
        )}
      </div>
    </div>
  );
}
