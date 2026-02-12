"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Goal = {
  id: string;
  title: string;
  yearsRemaining: number;
  probability: number; // 0..100
  current: number;
  target: number;
  monthlyContributionNeeded: number;
};

type ScenarioKey =
  | "salaryIncrease"
  | "marketDownturn"
  | "earlyRetirement"
  | "propertyPurchase";

type Scenario = {
  key: ScenarioKey;
  label: string;
  description: string;
  monthlyMultiplier: number;
  probabilityDelta: number;
};

const DEFAULT_GOALS: Goal[] = [
  {
    id: "fi",
    title: "Financial Independence",
    yearsRemaining: 8,
    probability: 84,
    current: 2847500,
    target: 5000000,
    monthlyContributionNeeded: 22422,
  },
  {
    id: "vac",
    title: "Vacation Home",
    yearsRemaining: 4,
    probability: 72,
    current: 340000,
    target: 850000,
    monthlyContributionNeeded: 10625,
  },
  {
    id: "edu",
    title: "Children Education",
    yearsRemaining: 12,
    probability: 91,
    current: 180000,
    target: 400000,
    monthlyContributionNeeded: 1528,
  },
  {
    id: "biz",
    title: "Business Venture",
    yearsRemaining: 2,
    probability: 88,
    current: 175000,
    target: 250000,
    monthlyContributionNeeded: 3125,
  },
];

const SCENARIOS: Scenario[] = [
  {
    key: "salaryIncrease",
    label: "Salary Increase",
    description:
      "Monthly contribution pressure reduces; probability improves slightly.",
    monthlyMultiplier: 0.85,
    probabilityDelta: 4,
  },
  {
    key: "marketDownturn",
    label: "Market Downturn",
    description:
      "More contribution required to stay on track; probability drops.",
    monthlyMultiplier: 1.15,
    probabilityDelta: -8,
  },
  {
    key: "earlyRetirement",
    label: "Early Retirement",
    description:
      "Shorter runway; contribution required increases; probability reduces.",
    monthlyMultiplier: 1.25,
    probabilityDelta: -10,
  },
  {
    key: "propertyPurchase",
    label: "Property Purchase",
    description:
      "Liquidity impact; contribution requirement increases slightly.",
    monthlyMultiplier: 1.1,
    probabilityDelta: -5,
  },
];

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function progressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return clamp((current / target) * 100, 0, 100);
}

function probabilityTone(p: number): "default" | "secondary" | "destructive" {
  if (p >= 85) return "default";
  if (p >= 70) return "secondary";
  return "destructive";
}

function ProgressBar({ value }: { value: number }) {
  const safe = clamp(value, 0, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

function GoalCard({
  goal,
  scenario,
  onEdit,
  onRequestDelete,
}: {
  goal: Goal;
  scenario: Scenario | null;
  onEdit: (goalId: string) => void;
  onRequestDelete: (goal: Goal) => void;
}) {
  const baseProgress = progressPercent(goal.current, goal.target);

  const adjustedMonthly = scenario
    ? Math.round(goal.monthlyContributionNeeded * scenario.monthlyMultiplier)
    : goal.monthlyContributionNeeded;

  const adjustedProb = scenario
    ? clamp(goal.probability + scenario.probabilityDelta, 0, 100)
    : goal.probability;

  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{goal.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {goal.yearsRemaining} years remaining
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={probabilityTone(adjustedProb)}
            className="font-medium"
          >
            {adjustedProb}% probability
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                aria-label="Goal actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(goal.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRequestDelete(goal)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="tabular-nums">{Math.round(baseProgress)}%</span>
          </div>
          <ProgressBar value={baseProgress} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {formatCurrency(goal.current)}
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">Target</div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {formatCurrency(goal.target)}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Monthly contribution needed
          </div>
          <div className="text-sm font-semibold tabular-nums">
            {formatCurrency(adjustedMonthly)}
          </div>
        </div>

        {scenario ? (
          <p className="text-xs text-muted-foreground">
            {scenario.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function GoalsDashboard() {
  const router = useRouter();

  const [goals, setGoals] = React.useState<Goal[]>(DEFAULT_GOALS);

  const [activeScenario, setActiveScenario] =
    React.useState<ScenarioKey | null>(null);

  const scenario = React.useMemo<Scenario | null>(() => {
    if (!activeScenario) return null;
    return SCENARIOS.find((s) => s.key === activeScenario) ?? null;
  }, [activeScenario]);

  // delete confirm dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Goal | null>(null);

  const goToAddGoal = (): void => {
    router.push("/dashboard/goals/new");
  };

  const goToEditGoal = (goalId: string): void => {
    router.push(`/dashboard/goals/${goalId}/edit`);
  };

  const requestDelete = (goal: Goal): void => {
    setPendingDelete(goal);
    setDeleteOpen(true);
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;
    setGoals((prev) => prev.filter((g) => g.id !== pendingDelete.id));
    setDeleteOpen(false);
    setPendingDelete(null);
  };

  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Goals & Life Planning
            </h1>
            <p className="text-sm text-muted-foreground">
              Track progress toward milestones.
            </p>
          </div>

          <Button onClick={goToAddGoal} className="gap-2">
            <Plus className="h-4 w-4" />
            Add goal
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              scenario={scenario}
              onEdit={goToEditGoal}
              onRequestDelete={requestDelete}
            />
          ))}
        </div>

        {/* Scenario modeling */}
        <Card className="mt-6 border-muted/60 bg-background/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">AI Scenario Modeling</CardTitle>
            <p className="text-sm text-muted-foreground">
              See how life changes could affect your goals.
            </p>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            {SCENARIOS.map((s) => {
              const isActive = s.key === activeScenario;
              return (
                <Button
                  key={s.key}
                  type="button"
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    "rounded-full",
                    isActive
                      ? ""
                      : "bg-muted/60 text-foreground hover:bg-muted",
                  )}
                  onClick={() =>
                    setActiveScenario((prev) => (prev === s.key ? null : s.key))
                  }
                >
                  {s.label}
                </Button>
              );
            })}

            {activeScenario ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => setActiveScenario(null)}
              >
                Clear
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  This will permanently remove{" "}
                  <span className="font-medium text-foreground">
                    {pendingDelete.title}
                  </span>
                  . You can’t undo this action.
                </>
              ) : (
                "This will permanently remove this goal. You can’t undo this action."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingDelete(null);
                setDeleteOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
