"use client";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { incomeSchema, type IncomeFormValues } from "@/lib/onboarding/schemas";
import type { IncomeData } from "@/lib/onboarding/types";
import { ArrowRight, Trash2, Plus, RefreshCw, Pencil } from "lucide-react";
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

// ── Inline edit popover for a single saved income row ────────────────────────
function EditIncomePopover({
  income,
  preferredCurrency,
  takenCategories,
  onSave,
}: {
  income: IncomeData;
  preferredCurrency: string;
  takenCategories: string[];
  onSave: (updated: IncomeData) => void;
}) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, watch, control } =
    useForm<IncomeFormValues>({
      resolver: zodResolver(incomeSchema) as never,
      defaultValues: {
        name: income.name,
        amount_monthly: income.amount_monthly,
        category: income.category,
        is_recurring: income.is_recurring,
      },
    });

  const isRecurring = watch("is_recurring");
  const category = watch("category");

  function save(data: IncomeFormValues) {
    onSave({ ...data, amount_monthly: data.amount_monthly as number });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-slate-400 hover:text-indigo-600 transition-colors"
          aria-label="Edit income"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end" sideOffset={8}>
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Edit income</h4>
            <p className="text-sm text-muted-foreground">
              Update the details for this income source.
            </p>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Income type</Label>
            <Select
              defaultValue={income.category}
              onValueChange={(v) => {
                setValue("category", v);
                if (v !== "Other")
                  setValue("name", v, { shouldValidate: true });
                else setValue("name", "");
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_CATEGORIES.map((c) => {
                  // Disable non-Other categories taken by OTHER entries
                  const isTaken =
                    c !== "Other" &&
                    c !== income.category &&
                    takenCategories.includes(c);
                  return (
                    <SelectItem key={c} value={c} disabled={isTaken}>
                      {c}
                      {isTaken && (
                        <span className="ml-2 text-xs text-slate-400">
                          (already added)
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Name – only shown for Other */}
          {category === "Other" && (
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                className="h-8"
                placeholder="e.g. Tutoring"
                {...register("name")}
              />
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Monthly amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="amount_monthly"
                className="h-8 pl-10"
              />
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={isRecurring}
              onCheckedChange={(v) => setValue("is_recurring", v)}
            />
            <span className="text-sm text-slate-600">Monthly recurring</span>
          </div>

          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={handleSubmit(save)}
          >
            Save changes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function Step3Income({ defaultValues = [], onComplete }: any) {
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
    trigger,
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
  const selectedCategory = watch("category");
  const watchedValues = watch();

  // Non-Other categories that are already saved
  const takenCategories = incomes
    .filter((inc) => inc.category !== "Other")
    .map((inc) => inc.category);

  function addIncome(data: IncomeFormValues) {
    setIncomes((prev) => [
      ...prev,
      { ...data, amount_monthly: data.amount_monthly as number },
    ]);
    reset({ name: "", amount_monthly: 0, category: "", is_recurring: true });
    setListError("");
  }

  function handleCategoryChange(v: string) {
    setValue("category", v);
    if (v !== "Other") setValue("name", v, { shouldValidate: true });
    else setValue("name", "");
  }

  function removeIncome(i: number) {
    setIncomes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateIncome(i: number, updated: IncomeData) {
    setIncomes((prev) => prev.map((inc, idx) => (idx === i ? updated : inc)));
  }

  // ✅ Auto-add on continue
  async function handleNext() {
    const hasPartial =
      watchedValues.name ||
      watchedValues.amount_monthly ||
      watchedValues.category;

    if (hasPartial) {
      const valid = await trigger();
      if (!valid) return;
      addIncome(watchedValues as IncomeFormValues);
    }

    if (incomes.length === 0 && !hasPartial) {
      setListError("Add at least one income source to continue.");
      return;
    }

    onComplete(
      hasPartial ? [...incomes, { ...watchedValues } as IncomeData] : incomes,
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold text-slate-900">
          Your monthly income
        </h1>
        <p className="mt-2 text-slate-500">
          Add all income sources. This helps us build a realistic financial
          plan.
        </p>
      </div>

      {/* Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* FORM */}
        <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Add income
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Fill details and save to add it to your list
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Income type</Label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_CATEGORIES.map((c) => {
                  const isTaken = c !== "Other" && takenCategories.includes(c);
                  return (
                    <SelectItem key={c} value={c} disabled={isTaken}>
                      {c}
                      {isTaken && (
                        <span className="ml-2 text-xs text-slate-400">
                          (already added)
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Name if Other */}
          {selectedCategory === "Other" && (
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g. Tutoring" {...register("name")} />
            </div>
          )}

          {/* Amount + toggle */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Monthly amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {getCurrencyPrefix(preferredCurrency)}
                </span>
                <CurrencyNumberInputField
                  control={control}
                  name="amount_monthly"
                  className="pl-12"
                />
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-3">
                <Switch
                  checked={isRecurring}
                  onCheckedChange={(v) => setValue("is_recurring", v)}
                />
                <span className="text-sm text-slate-600">
                  Monthly recurring
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(addIncome)}
            className="w-full gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Save income
          </Button>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Saved ({incomes.length})
            </p>
          </div>

          {incomes.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No income added yet
            </div>
          )}

          {incomes.map((inc, i) => (
            <div
              key={i}
              className="flex justify-between items-center rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{inc.name}</p>
                  {inc.is_recurring && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Monthly
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {formatCurrencyAmount(inc.amount_monthly, preferredCurrency)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <EditIncomePopover
                  income={inc}
                  preferredCurrency={preferredCurrency}
                  takenCategories={takenCategories}
                  onSave={(updated) => updateIncome(i, updated)}
                />
                <button
                  type="button"
                  onClick={() => removeIncome(i)}
                  aria-label="Remove income"
                >
                  <Trash2 className="h-4 w-4 text-slate-300 hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          {incomes.length > 0 && (
            <div className="rounded-xl bg-slate-900 text-white p-5">
              <p className="text-sm text-slate-300">Total monthly income</p>
              <p className="text-2xl font-semibold mt-1">
                {formatCurrencyAmount(
                  incomes.reduce((s, inc) => s + Number(inc.amount_monthly), 0),
                  preferredCurrency,
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {listError && <p className="text-red-500">{listError}</p>}

      {/* Continue */}
      <Button onClick={handleNext} className="w-full h-12 gap-2">
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
