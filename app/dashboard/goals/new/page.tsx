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

  const currentNum = React.useMemo(
    () => toNumber(form.current),
    [form.current],
  );
  const targetNum = React.useMemo(() => toNumber(form.target), [form.target]);
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

  const tone = React.useMemo(() => {
    // simple, readable heuristics (you can replace later with smarter model)
    if (targetNum > 0 && currentNum >= targetNum) return "complete";
    if (!targetNum || !timelineValueNum) return "neutral";
    if (progress >= 60) return "good";
    if (progress >= 30) return "ok";
    return "risk";
  }, [targetNum, currentNum, timelineValueNum, progress]);

  const statusLabel = React.useMemo(() => {
    if (tone === "complete") return "Completed";
    if (tone === "good") return "On track";
    if (tone === "ok") return "Making progress";
    if (tone === "risk") return "Needs attention";
    return "Draft";
  }, [tone]);

  const statusPillClass = React.useMemo(() => {
    switch (tone) {
      case "complete":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
      case "good":
        return "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300";
      case "ok":
        return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
      case "risk":
        return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300";
      default:
        return "border-muted bg-muted/40 text-muted-foreground";
    }
  }, [tone]);

  const progressBarClass = React.useMemo(() => {
    switch (tone) {
      case "complete":
        return "bg-emerald-500";
      case "good":
        return "bg-sky-500";
      case "ok":
        return "bg-amber-500";
      case "risk":
        return "bg-rose-500";
      default:
        return "bg-foreground/60";
    }
  }, [tone]);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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

          <div className="hidden items-center gap-2 md:flex">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                statusPillClass,
              )}
            >
              {tone === "complete" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="font-medium">{statusLabel}</span>
              {targetNum > 0 && timelineValueNum > 0 ? (
                <span className="text-muted-foreground">
                  • {Math.round(progress)}%
                </span>
              ) : null}
            </div>
          </div>
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
                  {tone === "complete" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="font-medium">{statusLabel}</span>
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
                <p className="text-sm text-muted-foreground">
                  This updates as you type.
                </p>
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
                      {statusLabel}
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
                </div>

                <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                  Tip: If the monthly amount feels too high, increase the
                  timeline or reduce the target.
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Quick UX polish</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Small details that make it feel premium.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/50" />
                  <p>
                    Currency prefix (GHS) is pinned inside inputs so users don’t
                    guess units.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/50" />
                  <p>
                    Live summary shows “needed per month” to make the goal feel
                    actionable.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/50" />
                  <p>
                    Status changes visually as users type, which feels
                    responsive and “smart”.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
