"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Minus,
  CalendarDays,
  Wallet,
  ClipboardCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

type ContributionForm = {
  amount: string;
  date: string; // YYYY-MM-DD
  note: string;
};

type MilestoneForm = {
  title: string;
  date: string; // YYYY-MM-DD
  note: string;
};

type LogItem =
  | {
      id: string;
      type: "contribution";
      amount: number;
      date: string;
      note?: string;
    }
  | {
      id: string;
      type: "milestone";
      title: string;
      date: string;
      note?: string;
    };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatNumberWithCommas(value: string): string {
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
  return new Intl.NumberFormat("en-GH", { maximumFractionDigits: 0 }).format(n);
}

function todayISO(): string {
  // local yyyy-mm-dd
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const goalId = params?.id ?? "goal_123"; // fallback for dev

  // ---- Load existing goal (replace with real fetch) ----
  const [isLoading, setIsLoading] = React.useState(true);

  const [form, setForm] = React.useState<GoalForm>({
    title: "",
    target: "",
    current: "",
    timelineValue: "",
    timelineUnit: "years",
  });

  const [originalCurrent, setOriginalCurrent] = React.useState(0);

  // Activity log (contributions + milestones)
  const [log, setLog] = React.useState<LogItem[]>([]);

  // Add contribution drawer state
  const [contrib, setContrib] = React.useState<ContributionForm>({
    amount: "",
    date: todayISO(),
    note: "",
  });

  // Add milestone state
  const [milestone, setMilestone] = React.useState<MilestoneForm>({
    title: "",
    date: todayISO(),
    note: "",
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [showCustomContribution, setShowCustomContribution] =
    React.useState(false);

  // Simulated load
  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);

      // Replace this with:
      // const res = await fetch(`/api/goals/${goalId}`);
      // const data = await res.json();

      // Demo seed
      const seed = {
        title: "Emergency fund",
        target: 500000,
        current: 120000,
        timeline: { value: 5, unit: "years" as const },
        log: [
          {
            id: "l1",
            type: "contribution" as const,
            amount: 20000,
            date: "2026-01-10",
            note: "Monthly transfer",
          },
          {
            id: "l2",
            type: "milestone" as const,
            title: "Reached first 100k",
            date: "2026-01-22",
            note: "Consistency is working",
          },
          {
            id: "l3",
            type: "contribution" as const,
            amount: 15000,
            date: "2026-02-05",
            note: "Bonus top-up",
          },
        ],
      };

      if (!mounted) return;

      setForm({
        title: seed.title,
        target: currency(seed.target),
        current: currency(seed.current),
        timelineValue: String(seed.timeline.value),
        timelineUnit: seed.timeline.unit,
      });

      setOriginalCurrent(seed.current);
      setLog(seed.log);
      setIsLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [goalId]);

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

  const isComplete = targetNum > 0 && currentNum >= targetNum;

  const tone = React.useMemo(() => {
    if (isComplete) return "complete";
    if (!targetNum || !timelineValueNum) return "neutral";
    if (progress >= 60) return "good";
    if (progress >= 30) return "ok";
    return "risk";
  }, [isComplete, targetNum, timelineValueNum, progress]);

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

  // --- Contribution helpers ---
  const contribAmountNum = React.useMemo(
    () => toNumber(contrib.amount),
    [contrib.amount],
  );

  function addContribution(): void {
    if (!contribAmountNum || contribAmountNum <= 0) return;
    const id = `c_${Date.now()}`;

    setLog((prev) => [
      {
        id,
        type: "contribution",
        amount: contribAmountNum,
        date: contrib.date || todayISO(),
        note: contrib.note?.trim() || undefined,
      },
      ...prev,
    ]);

    // Optimistically update current
    update("current", currency(currentNum + contribAmountNum));

    setContrib({ amount: "", date: todayISO(), note: "" });
    setShowCustomContribution(false);
  }

  // --- Milestone helpers ---
  function addMilestone(): void {
    if (!milestone.title.trim()) return;
    const id = `m_${Date.now()}`;

    setLog((prev) => [
      {
        id,
        type: "milestone",
        title: milestone.title.trim(),
        date: milestone.date || todayISO(),
        note: milestone.note?.trim() || undefined,
      },
      ...prev,
    ]);

    setMilestone({ title: "", date: todayISO(), note: "" });
  }

  function removeLogItem(id: string): void {
    const item = log.find((x) => x.id === id);
    setLog((prev) => prev.filter((x) => x.id !== id));

    // If removing a contribution, reverse the optimistic update
    if (item?.type === "contribution") {
      update("current", currency(Math.max(0, currentNum - item.amount)));
    }
  }

  const deltaSinceLoad = currentNum - originalCurrent;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        id: goalId,
        title: form.title.trim(),
        target: toNumber(form.target),
        current: toNumber(form.current),
        yearsRemaining,
        timeline: {
          value: Number(form.timelineValue),
          unit: form.timelineUnit,
        },
        activityLog: log,
      };

      console.log("Save goal:", payload);

      // Example API call:
      // await fetch(`/api/goals/${goalId}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      router.push("/dashboard/goals");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
          <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Loading goal…</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
                Edit goal
              </h1>
              <p className="text-sm text-muted-foreground">
                Update the goal details and log real progress.
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
                <TrendingUp className="h-4 w-4" />
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

        <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-3">
          {/* Left: Main card */}
          <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur lg:col-span-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Goal details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Edit the setup, then record actions below.
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
                    <TrendingUp className="h-4 w-4" />
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
                    You can edit this directly, or use “Add contribution” below.
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
                    <p className="text-sm font-medium">Progress</p>
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
                      {targetNum > 0 ? `${Math.round(progress)}%` : "-"}
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

                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <span>
                    Remaining:{" "}
                    <span className="font-medium text-foreground">
                      GHS {currency(remaining)}
                    </span>
                  </span>
                  <span>
                    Needed / month:{" "}
                    <span className="font-medium text-foreground">
                      {requiredPerMonth > 0
                        ? `GHS ${currency(requiredPerMonth)}`
                        : "-"}
                    </span>
                  </span>
                  {deltaSinceLoad !== 0 ? (
                    <span>
                      Since last edit:{" "}
                      <span className="font-medium text-foreground">
                        {deltaSinceLoad > 0 ? "+" : ""}
                        GHS {currency(Math.abs(deltaSinceLoad))}
                      </span>
                    </span>
                  ) : null}
                </div>

                {isComplete ? (
                  <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      You’ve hit your target. This goal is now completed.
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
                  disabled={isSaving || !isValid}
                  className="sm:w-auto"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Record activity + Timeline */}
          <div className="space-y-6">
            {/* Record progress */}
            <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Record progress</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add contributions and milestones to tell the story.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Quick actions */}
                {requiredPerMonth > 0 && !isComplete && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Quick actions</p>
                      <p className="text-xs text-muted-foreground">
                        Record common contributions with one tap.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const id = `c_${Date.now()}`;
                          setLog((prev) => [
                            {
                              id,
                              type: "contribution",
                              amount: requiredPerMonth,
                              date: todayISO(),
                              note: "Monthly contribution",
                            },
                            ...prev,
                          ]);
                          update(
                            "current",
                            currency(currentNum + requiredPerMonth),
                          );
                        }}
                        className="flex flex-col items-start gap-1 h-auto py-3"
                      >
                        <span className="text-xs text-muted-foreground">
                          Required
                        </span>
                        <span className="font-semibold">
                          GHS {currency(requiredPerMonth)}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const amount = Math.round(requiredPerMonth * 1.5);
                          const id = `c_${Date.now()}`;
                          setLog((prev) => [
                            {
                              id,
                              type: "contribution",
                              amount: amount,
                              date: todayISO(),
                              note: "Extra contribution",
                            },
                            ...prev,
                          ]);
                          update("current", currency(currentNum + amount));
                        }}
                        className="flex flex-col items-start gap-1 h-auto py-3"
                      >
                        <span className="text-xs text-muted-foreground">
                          Extra (1.5x)
                        </span>
                        <span className="font-semibold">
                          GHS {currency(Math.round(requiredPerMonth * 1.5))}
                        </span>
                      </Button>
                    </div>

                    <Separator />
                  </div>
                )}

                {/* Add contribution */}
                <Collapsible
                  open={showCustomContribution}
                  onOpenChange={setShowCustomContribution}
                >
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 mb-2 text-left"
                      >
                        <div className="rounded-full bg-foreground/10 p-2">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Custom contribution
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Add any amount with details.
                          </p>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform text-muted-foreground",
                            showCustomContribution && "rotate-180",
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="contrib-amount">Amount (GHS)</Label>
                          <Input
                            id="contrib-amount"
                            inputMode="numeric"
                            placeholder="10,000"
                            value={contrib.amount}
                            onChange={(e) =>
                              setContrib((p) => ({
                                ...p,
                                amount: formatNumberWithCommas(e.target.value),
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contrib-date">Date</Label>
                          <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="contrib-date"
                              type="date"
                              value={contrib.date}
                              onChange={(e) =>
                                setContrib((p) => ({
                                  ...p,
                                  date: e.target.value,
                                }))
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contrib-note">Note (optional)</Label>
                          <Textarea
                            id="contrib-note"
                            placeholder="e.g. Monthly transfer, side hustle income, bonus top-up"
                            value={contrib.note}
                            onChange={(e) =>
                              setContrib((p) => ({
                                ...p,
                                note: e.target.value,
                              }))
                            }
                            className="min-h-21"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={addContribution}
                          disabled={contribAmountNum <= 0}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add contribution
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Add milestone */}
                <div className="rounded-xl border bg-muted/20 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-full bg-foreground/10 p-2">
                      <ClipboardCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Add milestone</p>
                      <p className="text-xs text-muted-foreground">
                        Record progress that isn’t strictly money.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="mile-title">Title</Label>
                      <Input
                        id="mile-title"
                        placeholder="e.g. Opened investment account, Paid off a debt, Started auto-save"
                        value={milestone.title}
                        onChange={(e) =>
                          setMilestone((p) => ({ ...p, title: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mile-date">Date</Label>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mile-date"
                          type="date"
                          value={milestone.date}
                          onChange={(e) =>
                            setMilestone((p) => ({
                              ...p,
                              date: e.target.value,
                            }))
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mile-note">Note (optional)</Label>
                      <Textarea
                        id="mile-note"
                        placeholder="Short context helps later when reviewing progress."
                        value={milestone.note}
                        onChange={(e) =>
                          setMilestone((p) => ({ ...p, note: e.target.value }))
                        }
                        className="min-h-21"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addMilestone}
                      disabled={!milestone.title.trim()}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add milestone
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity timeline */}
            <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Activity</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your history for this goal.
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {log.length === 0 ? (
                  <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                    No activity yet. Add a contribution or milestone to start.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {log.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-start justify-between gap-3 rounded-xl border bg-background/40 p-3"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.type === "contribution" ? (
                              <Badge variant="secondary" className="gap-1">
                                <Wallet className="h-3 w-3" />
                                Contribution
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <ClipboardCheck className="h-3 w-3" />
                                Milestone
                              </Badge>
                            )}

                            <span className="text-xs text-muted-foreground">
                              {item.date}
                            </span>
                          </div>

                          <div className="mt-1 truncate text-sm font-medium">
                            {item.type === "contribution"
                              ? `+ GHS ${currency(item.amount)}`
                              : item.title}
                          </div>

                          {item.note ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {item.note}
                            </p>
                          ) : null}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLogItem(item.id)}
                          className={cn(
                            "h-8 w-8 rounded-full opacity-60 transition hover:opacity-100",
                            "text-muted-foreground hover:text-foreground",
                          )}
                          aria-label="Remove activity item"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
