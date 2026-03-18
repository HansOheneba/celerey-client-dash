"use client";

// components/onboarding/steps/Step3Income.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyNumberInputField } from "@/components/ui/currency-number-input-field";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { incomeSchema, type IncomeFormValues } from "@/lib/onboarding/schemas";
import type { IncomeData } from "@/lib/onboarding/types";
import { ArrowRight, Trash2, Plus, RefreshCw } from "lucide-react";
import { formatCurrencyAmount, getCurrencyPrefix } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

const INCOME_CATEGORIES = [
  "Salary",
  "Business",
  "Freelance",
  "Rental",
  "Investment",
  "Pension",
  "Side Income",
  "Other",
];

interface Step3IncomeProps {
  defaultValues?: IncomeData[];
  onComplete: (incomes: IncomeData[]) => void;
}

export function Step3Income({
  defaultValues = [],
  onComplete,
}: Step3IncomeProps) {
  const [incomes, setIncomes] = useState<IncomeData[]>(defaultValues);
  const [listError, setListError] = useState("");
  const store = useOnboardingStore();
  const preferredCurrency = store.identity?.preferred_currency || "USD";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema) as never,
    defaultValues: {
      name: "",
      amount_monthly: 0,
      category: "",
      is_recurring: true,
    },
  });

  const isRecurring = watch("is_recurring");

  function addIncome(data: IncomeFormValues) {
    setIncomes((prev) => [
      ...prev,
      { ...data, amount_monthly: data.amount_monthly as number },
    ]);
    reset({ name: "", amount_monthly: 0, category: "", is_recurring: true });
    setListError("");
  }

  function removeIncome(i: number) {
    setIncomes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleNext() {
    if (incomes.length === 0) {
      setListError("Please add at least one income source.");
      return;
    }
    onComplete(incomes);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          How does money come in?
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          Add all your income sources. Include monthly estimates for variable
          income.
        </p>
      </div>

      {/* Income entry form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Add income source
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="income-name">Source name</Label>
            <Input
              id="income-name"
              placeholder="e.g. Main Salary"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select onValueChange={(v) => setValue("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="income-amount">Monthly amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="amount_monthly"
                id="income-amount"
                placeholder="3500"
                className="pl-12"
              />
            </div>
            {errors.amount_monthly && (
              <p className="text-xs text-red-500">
                {errors.amount_monthly.message}
              </p>
            )}
          </div>

          <div className="flex items-end pb-1">
            <div className="flex items-center gap-3">
              <Switch
                id="is-recurring"
                checked={isRecurring}
                onCheckedChange={(v) => setValue("is_recurring", v)}
              />
              <Label htmlFor="is-recurring" className="cursor-pointer">
                Recurring monthly
              </Label>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2 border-dashed border-slate-300 text-slate-600 hover:border-[#151339] hover:text-[#151339]"
          onClick={handleSubmit(addIncome)}
        >
          <Plus className="h-4 w-4" />
          Add income source
        </Button>
      </div>

      {/* Incomes list */}
      {incomes.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Income sources ({incomes.length})
          </p>
          {incomes.map((inc, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      {inc.name}
                    </p>
                    {inc.is_recurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                        <RefreshCw className="h-2.5 w-2.5" />
                        Monthly
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatCurrencyAmount(
                      inc.amount_monthly,
                      preferredCurrency,
                    )}
                    /mo · {inc.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeIncome(i)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-600">
              Total monthly income
            </span>
            <span className="text-base font-semibold text-slate-900">
              {formatCurrencyAmount(
                incomes.reduce((s, inc) => s + Number(inc.amount_monthly), 0),
                preferredCurrency,
              )}
            </span>
          </div>
        </div>
      )}

      {listError && (
        <p className="text-sm text-red-500 font-medium">{listError}</p>
      )}

      <Button
        type="button"
        onClick={handleNext}
        className="w-full gap-2 bg-[#151339] hover:bg-[#1e1b55] text-white h-12 text-base rounded-xl"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
