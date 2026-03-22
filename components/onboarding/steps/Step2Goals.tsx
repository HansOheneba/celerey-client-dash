"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatDistanceToNow, isFuture } from "date-fns";
import { CalendarIcon, ArrowRight, Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CurrencyNumberInputField } from "@/components/ui/currency-number-input-field";
import { goalSchema, type GoalFormValues } from "@/lib/onboarding/schemas";
import type { GoalData } from "@/lib/onboarding/types";
import { cn, formatCurrencyAmount, getCurrencyPrefix } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboardingStore";

const SUGGESTED_GOALS = [
  "Emergency Fund",
  "Buy a Home",
  "Retire Early",
  "Pay off Debt",
  "Save for Education",
  "Build Wealth",
  "Travel Fund",
  "Start a Business",
];

function getGoalsHeading(mode?: "solo" | "partner" | "family") {
  if (mode === "partner")
    return "What are your household financial goals with your partner?";
  if (mode === "family") return "What are your family financial goals?";
  return "What are your financial goals?";
}

function getGoalsSubheading(mode?: "solo" | "partner" | "family") {
  if (mode === "partner") return "Add 1–3 goals that matter to your household.";
  if (mode === "family") return "Add 1–3 goals that matter to your family.";
  return "Add 1–3 financial goals. These guide your personalised plan.";
}

function naturalCountdown(date: Date): string {
  if (!isFuture(date)) return "That date has passed";
  return "In " + formatDistanceToNow(date);
}

interface Step2GoalsProps {
  defaultValues?: GoalData[];
  onComplete: (goals: GoalData[]) => void;
}

export function Step2Goals({
  defaultValues = [],
  onComplete,
}: Step2GoalsProps) {
  const [goals, setGoals] = useState<GoalData[]>(defaultValues);
  const [listError, setListError] = useState("");
  const store = useOnboardingStore();
  const preferredCurrency = store.identity?.preferred_currency || "USD";
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema) as never,
    defaultValues: { title: "", target_amount: 0, target_date: "" },
  });

  const titleValue = watch("title");
  const watchedValues = watch();

  function addGoal(data: GoalFormValues) {
    setGoals((prev) => [
      ...prev,
      {
        title: data.title,
        target_amount: data.target_amount as number,
        target_date: data.target_date,
        status: "active",
      },
    ]);
    reset({ title: "", target_amount: 0, target_date: "" });
    setListError("");
  }

  function removeGoal(i: number) {
    setGoals((prev) => prev.filter((_, idx) => idx !== i));
  }

  function applySuggestion(label: string) {
    setValue("title", label, { shouldValidate: true });
  }

  // 🔥 KEY FIX: Auto-add on Continue
  async function handleNext() {
    const hasPartialInput =
      watchedValues.title ||
      watchedValues.target_amount ||
      watchedValues.target_date;

    if (hasPartialInput) {
      const isValid = await trigger();

      if (!isValid) return;

      addGoal(watchedValues as GoalFormValues);
    }

    if (goals.length === 0 && !hasPartialInput) {
      setListError("Please add at least one goal to continue.");
      return;
    }

    onComplete(
      hasPartialInput
        ? [
            ...goals,
            {
              ...watchedValues,
              status: "active",
            } as GoalData,
          ]
        : goals,
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          {getGoalsHeading(store.identity?.account_mode)}
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          {getGoalsSubheading(store.identity?.account_mode)}
        </p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_GOALS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => applySuggestion(g)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              titleValue === g
                ? "border-[#151339] bg-[#151339] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#151339] hover:text-[#151339]"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Add a goal
        </p>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="goal-title">Goal name</Label>
          <Input
            id="goal-title"
            placeholder="e.g. Buy a Home"
            {...register("title")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(addGoal)();
              }
            }}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Target amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="target_amount"
                className="pl-12"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Target date</Label>
            <Controller
              control={control}
              name="target_date"
              render={({ field }) => {
                const dateValue = field.value
                  ? new Date(field.value)
                  : undefined;

                return (
                  <div className="space-y-1.5">
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateValue ? format(dateValue, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={dateValue}
                          captionLayout="dropdown"
                          startMonth={new Date(new Date().getFullYear(), 0)}
                          endMonth={new Date(new Date().getFullYear() + 50, 11)}
                          disabled={{ before: new Date() }}
                          onSelect={(date) => {
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            );
                            setCalendarOpen(false); // closes on select
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    {dateValue && (
                      <p className="text-xs text-[#151339]">
                        {naturalCountdown(dateValue)}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        <div className="flex items-end justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(addGoal)}
            className="gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Save goal
          </Button>
        </div>
      </div>

      {/* List */}
      {goals.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase text-slate-400">
            Your goals ({goals.length})
          </p>

          {goals.map((g, i) => (
            <div
              key={i}
              className="flex justify-between items-center border p-4 rounded-xl"
            >
              <div>
                <p className="text-sm font-medium">{g.title}</p>
                <p className="text-xs text-slate-500">
                  {formatCurrencyAmount(g.target_amount, preferredCurrency)} ·{" "}
                  {naturalCountdown(new Date(g.target_date))}
                </p>
              </div>

              <button onClick={() => removeGoal(i)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {listError && <p className="text-red-500">{listError}</p>}

      {/* Continue */}
      <Button onClick={handleNext} className="w-full gap-2 h-12">
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
