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

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema) as never,
    defaultValues: { title: "", target_amount: 0, target_date: "" },
  });

  const titleValue = watch("title");

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

  function handleNext() {
    if (goals.length === 0) {
      setListError("Please add at least one goal to continue.");
      return;
    }
    onComplete(goals);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          What are you working towards?
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          Add 1–3 financial goals. These guide your personalised plan.
        </p>
      </div>

      {/* Quick-select suggestions */}
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

      {/* Goal entry form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Add a goal
        </p>

        {/* Goal name */}
        <div className="space-y-1.5">
          <Label htmlFor="goal-title">Goal name</Label>
          <Input
            id="goal-title"
            placeholder="e.g. Buy a Home"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Target amount */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-amount">Target amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {getCurrencyPrefix(preferredCurrency)}
              </span>
              <CurrencyNumberInputField
                control={control}
                name="target_amount"
                id="goal-amount"
                placeholder="50,000"
                className="pl-12"
              />
            </div>
            {errors.target_amount && (
              <p className="text-xs text-red-500">
                {errors.target_amount.message}
              </p>
            )}
          </div>

          {/* Target date — dropdown navigation + natural language */}
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !field.value && "text-slate-400",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                          {dateValue ? format(dateValue, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={dateValue}
                          defaultMonth={dateValue ?? new Date()}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd") : "",
                            );
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          startMonth={new Date()}
                          endMonth={
                            new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() + 50,
                              ),
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Natural language countdown */}
                    {dateValue && isFuture(dateValue) && (
                      <p className="text-xs font-medium text-[#151339]">
                        {naturalCountdown(dateValue)}
                      </p>
                    )}
                    {dateValue && !isFuture(dateValue) && (
                      <p className="text-xs text-red-400">
                        That date has already passed
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {errors.target_date && (
              <p className="text-xs text-red-500">
                {errors.target_date.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2 border-dashed border-slate-300 text-slate-600 hover:border-[#151339] hover:text-[#151339]"
          onClick={handleSubmit(addGoal)}
        >
          <Plus className="h-4 w-4" />
          Add goal
        </Button>
      </div>

      {/* Goals list */}
      {goals.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Your goals ({goals.length})
          </p>
          {goals.map((g, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{g.title}</p>
                <p className="text-xs text-slate-500">
                  {formatCurrencyAmount(g.target_amount, preferredCurrency)} ·
                  by{" "}
                  {new Date(g.target_date).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  <span className="text-[#151339]">
                    · {naturalCountdown(new Date(g.target_date))}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeGoal(i)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
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
