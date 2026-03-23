"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  ArrowRight,
  Trash2,
  Plus,
  RefreshCw,
  Pencil,
  ChevronLeft,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
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

const CATEGORY_COLORS: Record<string, string> = {
  Salary: "bg-blue-100 text-blue-700",
  Business: "bg-purple-100 text-purple-700",
  Freelance: "bg-orange-100 text-orange-700",
  Rental: "bg-green-100 text-green-700",
  Investment: "bg-teal-100 text-teal-700",
  Pension: "bg-slate-100 text-slate-700",
  "Side Income": "bg-pink-100 text-pink-700",
  Other: "bg-gray-100 text-gray-700",
};

/* ─── Edit popover ─────────────────────────────────────────────── */
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
          className="text-slate-400 hover:text-[#151339] transition-colors"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end" sideOffset={8}>
        <div className="grid gap-4">
          <p className="text-sm font-semibold text-slate-800">
            Edit income source
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs">Income type</Label>
            <Select
              defaultValue={income.category}
              onValueChange={(v) => {
                setValue("category", v);
                if (v !== "Other")
                  setValue("name", v, { shouldValidate: true });
                else setValue("name", "");
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCOME_CATEGORIES.map((c) => {
                  const isTaken =
                    c !== "Other" &&
                    c !== income.category &&
                    takenCategories.includes(c);
                  return (
                    <SelectItem key={c} value={c} disabled={isTaken}>
                      {c}
                      {isTaken && (
                        <span className="ml-2 text-xs text-slate-400">
                          (added)
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {category === "Other" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                className="h-8 text-sm"
                placeholder="e.g. Tutoring"
                {...register("name")}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Monthly amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="amount_monthly"
                className="h-8 pl-10 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isRecurring}
              onCheckedChange={(v) => setValue("is_recurring", v)}
            />
            <span className="text-sm text-slate-600">Monthly recurring</span>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full bg-[#151339] text-white"
            onClick={handleSubmit(save)}
          >
            Save changes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Accordion Income Item ────────────────────────────────────── */
function IncomeAccordionItem({
  income,
  index,
  preferredCurrency,
  takenCategories,
  onUpdate,
  onRemove,
}: {
  income: IncomeData;
  index: number;
  preferredCurrency: string;
  takenCategories: string[];
  onUpdate: (i: number, updated: IncomeData) => void;
  onRemove: (i: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const colorClass =
    CATEGORY_COLORS[income.category] ?? "bg-gray-100 text-gray-700";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-xl border border-slate-100 bg-white"
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/60 transition-colors"
      >
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${colorClass}`}
        >
          {income.category}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {income.name}
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
          {formatCurrencyAmount(income.amount_monthly, preferredCurrency)}
          <span className="text-xs text-slate-400 font-normal">/mo</span>
        </p>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {income.is_recurring && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <RefreshCw className="h-2.5 w-2.5" /> Monthly recurring
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <EditIncomePopover
                  income={income}
                  preferredCurrency={preferredCurrency}
                  takenCategories={takenCategories}
                  onSave={(updated) => onUpdate(index, updated)}
                />
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label="Remove"
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Step ─────────────────────────────────────────────────── */
export function Step3Income({ defaultValues = [], onComplete, onBack }: any) {
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

  const takenCategories = incomes
    .filter((i) => i.category !== "Other")
    .map((i) => i.category);

  const totalMonthlyIncome = incomes.reduce(
    (s, i) => s + Number(i.amount_monthly),
    0,
  );

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          Your monthly income
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          Add all your income sources so we can build a realistic financial
          plan.
        </p>
      </div>

      {/* Total card — always visible at top, shows 0 if empty */}
      <div className="rounded-2xl bg-[#151339] text-white p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/60 uppercase tracking-widest">
            Total monthly income
          </p>
          <motion.p
            key={totalMonthlyIncome}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold mt-1 tabular-nums"
          >
            {formatCurrencyAmount(totalMonthlyIncome, preferredCurrency)}
          </motion.p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <TrendingUp className="h-5 w-5 text-white/80" />
        </div>
      </div>

      {/* Income list — accordion */}
      {incomes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Sources ({incomes.length})
          </p>
          <AnimatePresence>
            {incomes.map((inc, i) => (
              <IncomeAccordionItem
                key={`${inc.category}-${i}`}
                income={inc}
                index={i}
                preferredCurrency={preferredCurrency}
                takenCategories={takenCategories}
                onUpdate={updateIncome}
                onRemove={removeIncome}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add income form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Add income source
        </p>

        {/* Category */}
        <div className="space-y-1.5">
          <Label>Income type</Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input placeholder="e.g. Tutoring" {...register("name")} />
          </div>
        )}

        {/* Amount + recurring */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
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
            {errors.amount_monthly && (
              <p className="text-xs text-red-500">
                {(errors.amount_monthly as any).message}
              </p>
            )}
          </div>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-3">
              <Switch
                checked={isRecurring}
                onCheckedChange={(v) => setValue("is_recurring", v)}
              />
              <span className="text-sm text-slate-600">Monthly recurring</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(addIncome)}
            className="gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" /> Save income
          </Button>
        </div>
      </div>

      {listError && <p className="text-sm text-red-500">{listError}</p>}

      {/* CTA */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 gap-1 h-12 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={
            incomes.length === 0 &&
            !(
              watchedValues.category &&
              Number(watchedValues.amount_monthly) > 0 &&
              (watchedValues.category !== "Other" || !!watchedValues.name)
            )
          }
          className="flex-1 h-12 gap-2 bg-[#151339] hover:bg-[#1e1b55] text-white rounded-xl"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
