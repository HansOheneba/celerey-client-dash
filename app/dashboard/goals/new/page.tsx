"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cashFlowData, savingsData } from "@/lib/client-data";

type GoalForm = {
  title: string;
  target: string;
  current: string;
  timelineValue: string;
  timelineUnit: "months" | "years";
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatNumberWithCommas(value: string): string {
  // keep digits only, then add commas
  return value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toNumber(value: string): number {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function clamp(min: number, v: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function pct(current: number, target: number): number {
  if (target <= 0) return 0;
  return clamp(0, (current / target) * 100, 100);
}

function currency(n: number): string {
  return new Intl.NumberFormat("en-GH", {
    maximumFractionDigits: 0,
  }).format(n);
}

export default function NewGoalPage() {
  const router = useRouter();

  const [form, setForm] = React.useState<GoalForm>({
    title: "",
    target: "",
    current: "",
    timelineValue: "",
    timelineUnit: "years",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function update<K extends keyof GoalForm>(key: K, value: GoalForm[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMoneyInput(key: "target" | "current", value: string): void {
    update(key, formatNumberWithCommas(value));
  }

  const currentRaw = form.current;
  const targetRaw = form.target;

  const currentNum = React.useMemo(() => toNumber(currentRaw), [currentRaw]);
  const targetNum = React.useMemo(() => toNumber(targetRaw), [targetRaw]);
  const progress = React.useMemo(
    () => pct(currentNum, targetNum),
    [currentNum, targetNum],
  );

  const timelineValueNum = React.useMemo(
    () => Number(form.timelineValue || 0),
    [form.timelineValue],
  );

  const yearsRemaining = React.useMemo(() => {
    if (!timelineValueNum) return 0;
    return form.timelineUnit === "months"
      ? timelineValueNum / 12
      : timelineValueNum;
  }, [timelineValueNum, form.timelineUnit]);

  const remaining = React.useMemo(() => {
    const r = targetNum - currentNum;
    return r > 0 ? r : 0;
  }, [targetNum, currentNum]);

  const requiredPerMonth = React.useMemo(() => {
    if (!yearsRemaining || yearsRemaining <= 0) return 0;
    const months = yearsRemaining * 12;
    if (months <= 0) return 0;
    return Math.ceil(remaining / months);
  }, [remaining, yearsRemaining]);

  /* ── Cash-flow context ─────────────────────────────────────────── */
  const monthlyIncome = React.useMemo(
    () => cashFlowData.income.reduce((s, r) => s + r.amount, 0),
    [],
  );
  const monthlyExpenses = React.useMemo(
    () => cashFlowData.expenses.reduce((s, r) => s + r.amount, 0),
    [],
  );
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const monthlySavings = savingsData.monthlySavings;

  // What's the max target achievable in the given timeline?
  // (used to compute recommended comfort target below)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const maxReachable = React.useMemo(() => {
    if (!yearsRemaining) return 0;
    return currentNum + monthlySavings * yearsRemaining * 12;
  }, [currentNum, monthlySavings, yearsRemaining]);

  // How many months would the remaining actually take at current savings rate?
  const monthsNeeded = React.useMemo(() => {
    if (remaining <= 0 || monthlySavings <= 0) return 0;
    return Math.ceil(remaining / monthlySavings);
  }, [remaining, monthlySavings]);

  // Ratio: required-per-month vs surplus
  const savingsRatio = React.useMemo(() => {
    if (monthlySurplus <= 0 || requiredPerMonth <= 0) return 0;
    return requiredPerMonth / monthlySurplus;
  }, [requiredPerMonth, monthlySurplus]);

  /* ── Tone + contextual insight ─────────────────────────────────── */
  type Insight = {
    tone: "complete" | "good" | "ok" | "stretch" | "neutral";
    label: string;
    message: string;
  };

  const insight: Insight = React.useMemo(() => {
    if (targetNum > 0 && currentNum >= targetNum) {
      return {
        tone: "complete",
        label: "Completed",
        message: "You've already reached this target — nice work.",
      };
    }
    if (!targetNum || !timelineValueNum) {
      return {
        tone: "neutral",
        label: "Draft",
        message:
          "Fill in the amounts and timeline to see personalised guidance.",
      };
    }

    // Can they cover it comfortably?
    if (savingsRatio <= 0.3) {
      return {
        tone: "good",
        label: "On track",
        message: `At your current savings rate (GHS ${currency(monthlySavings)}/mo), you can reach this comfortably within ${timelineValueNum} ${form.timelineUnit}.`,
      };
    }
    if (savingsRatio <= 0.6) {
      return {
        tone: "ok",
        label: "Achievable",
        message: `This would take about ${Math.round(savingsRatio * 100)}% of your monthly surplus. It's doable, just keep the pace steady.`,
      };
    }
    if (savingsRatio <= 1) {
      const suggestedTimeline =
        monthsNeeded > 0
          ? monthsNeeded >= 12
            ? `${(monthsNeeded / 12).toFixed(1)} years`
            : `${monthsNeeded} months`
          : null;
      return {
        tone: "stretch",
        label: "Ambitious",
        message: suggestedTimeline
          ? `Based on your cash flow, you'd need GHS ${currency(requiredPerMonth)}/mo, that's ${Math.round(savingsRatio * 100)}% of your surplus. A more comfortable timeline would be around ${suggestedTimeline}.`
          : `This would require most of your monthly surplus. Consider a longer timeline or a smaller target.`,
      };
    }
    // savingsRatio > 1
    const comfortTarget =
      currentNum + monthlySavings * yearsRemaining * 12 * 0.5; // 50 % of surplus
    const suggestedTimeline =
      monthsNeeded >= 12
        ? `${(monthsNeeded / 12).toFixed(1)} years`
        : `${monthsNeeded} months`;
    return {
      tone: "stretch",
      label: "Needs a bigger runway",
      message: `At GHS ${currency(monthlySavings)}/mo savings, reaching GHS ${currency(targetNum)} would take ~${suggestedTimeline}. To stay within ${timelineValueNum} ${form.timelineUnit}, we'd recommend a target closer to GHS ${currency(comfortTarget)}.`,
    };
  }, [
    targetNum,
    currentNum,
    timelineValueNum,
    savingsRatio,
    monthlySavings,
    requiredPerMonth,
    monthsNeeded,
    yearsRemaining,
    form.timelineUnit,
  ]);

  const statusPillClass = React.useMemo(() => {
    switch (insight.tone) {
      case "complete":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
      case "good":
        return "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300";
      case "ok":
        return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
      case "stretch":
        return "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300";
      default:
        return "border-muted bg-muted/40 text-muted-foreground";
    }
  }, [insight.tone]);

  const progressBarClass = React.useMemo(() => {
    switch (insight.tone) {
      case "complete":
        return "bg-emerald-500";
      case "good":
        return "bg-sky-500";
      case "ok":
        return "bg-amber-500";
      case "stretch":
        return "bg-orange-500";
      default:
        return "bg-foreground/60";
    }
  }, [insight.tone]);

  const isValid =
    form.title.trim().length > 0 &&
    toNumber(form.current) >= 0 &&
    toNumber(form.target) > 0 &&
    Number(form.timelineValue) >= 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        target: toNumber(form.target),
        current: toNumber(form.current),
        yearsRemaining,
        timeline: {
          value: Number(form.timelineValue),
          unit: form.timelineUnit,
        },
      };

      console.log("New goal:", payload);

      // Example API call:
      // await fetch("/api/goals", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      router.push("/dashboard/goals");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Create a goal
              </h1>
              <p className="text-sm text-muted-foreground">
                Build a clear target, timeline, and saving pace.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex"></div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* Left: Main card */}
          <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur lg:col-span-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Goal setup</CardTitle>
              <p className="text-sm text-muted-foreground">
                Keep it simple — you can refine later.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mobile status pill */}
              <div className="md:hidden">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                    statusPillClass,
                  )}
                >
                  {insight.tone === "complete" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="font-medium">{insight.label}</span>
                  {targetNum > 0 && timelineValueNum > 0 ? (
                    <span className="text-muted-foreground">
                      • {Math.round(progress)}%
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Goal name</Label>
                <Input
                  id="title"
                  placeholder="e.g. Buy a home, Emergency fund, Car deposit"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                />
              </div>

              <Separator />

              {/* Amounts */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current">Current amount</Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      GHS
                    </div>
                    <Input
                      id="current"
                      type="text"
                      inputMode="numeric"
                      placeholder="100,000"
                      value={form.current}
                      onChange={(e) =>
                        handleMoneyInput("current", e.target.value)
                      }
                      className="pl-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    What you’ve saved toward this goal so far.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target amount</Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      GHS
                    </div>
                    <Input
                      id="target"
                      type="text"
                      inputMode="numeric"
                      placeholder="500,000"
                      value={form.target}
                      onChange={(e) =>
                        handleMoneyInput("target", e.target.value)
                      }
                      className="pl-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The amount you want to reach.
                  </p>
                </div>
              </div>

              {/* Progress preview */}
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Progress preview</p>
                    <p className="text-xs text-muted-foreground">
                      {targetNum > 0 ? (
                        <>
                          GHS {currency(currentNum)} of GHS{" "}
                          {currency(targetNum)}
                        </>
                      ) : (
                        <>Add a target to see progress.</>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      {targetNum > 0 ? `${Math.round(progress)}%` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">complete</p>
                  </div>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      progressBarClass,
                    )}
                    style={{ width: `${Math.round(progress)}%` }}
                    aria-label="Goal progress"
                  />
                </div>

                {targetNum > 0 ? (
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <span>
                      Remaining:{" "}
                      <span className="font-medium text-foreground">
                        GHS {currency(remaining)}
                      </span>
                    </span>
                    <span>
                      Current:{" "}
                      <span className="font-medium text-foreground">
                        GHS {currency(currentNum)}
                      </span>
                    </span>
                    <span>
                      Target:{" "}
                      <span className="font-medium text-foreground">
                        GHS {currency(targetNum)}
                      </span>
                    </span>
                  </div>
                ) : null}
              </div>

              <Separator />

              {/* Timeline */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timeline-unit">Timeline unit</Label>
                  <Select
                    value={form.timelineUnit}
                    onValueChange={(value) =>
                      update("timelineUnit", value as GoalForm["timelineUnit"])
                    }
                  >
                    <SelectTrigger id="timeline-unit" className="w-full">
                      <SelectValue placeholder="Select a time unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose months for short goals, years for longer goals.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline-value">
                    Duration ({form.timelineUnit})
                  </Label>
                  <Input
                    id="timeline-value"
                    type="number"
                    min="1"
                    placeholder={form.timelineUnit === "months" ? "24" : "10"}
                    value={form.timelineValue}
                    onChange={(e) => update("timelineValue", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    How long you’re giving yourself to hit the target.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard/goals")}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="sm:w-auto"
                >
                  {isSubmitting ? "Saving..." : "Create goal"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Summary + helper card */}
          <div className="space-y-6">
            <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                        statusPillClass,
                      )}
                    >
                      {insight.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-sm font-semibold">
                      {targetNum > 0 ? `${Math.round(progress)}%` : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Remaining
                    </span>
                    <span className="text-sm font-semibold">
                      {targetNum > 0 ? `GHS ${currency(remaining)}` : "—"}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Timeline
                    </span>
                    <span className="text-sm font-semibold">
                      {timelineValueNum >= 1
                        ? `${timelineValueNum} ${form.timelineUnit}`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Needed / month
                    </span>
                    <span className="text-sm font-semibold">
                      {requiredPerMonth > 0
                        ? `GHS ${currency(requiredPerMonth)}`
                        : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      Your surplus
                    </span>
                    <span className="text-sm font-semibold">
                      GHS {currency(monthlySurplus)}/mo
                    </span>
                  </div>
                </div>

                {/* Contextual insight instead of generic tip */}
                <div
                  className={cn(
                    "rounded-xl border p-3 text-xs leading-relaxed",
                    insight.tone === "good"
                      ? "border-sky-500/20 bg-sky-500/5 text-sky-800 dark:text-sky-300"
                      : insight.tone === "ok"
                        ? "border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300"
                        : insight.tone === "stretch"
                          ? "border-orange-500/20 bg-orange-500/5 text-orange-800 dark:text-orange-300"
                          : insight.tone === "complete"
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                            : "border-muted bg-muted/20 text-muted-foreground",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span>{insight.message}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
