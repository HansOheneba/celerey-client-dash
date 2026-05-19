import React from "react";
import {
  Pencil,
  Trash2,
  CheckCircle2,
  CalendarDays,
  Wallet,
} from "lucide-react";

import { DashCard, CardContent } from "@/components/dashboard/dash-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { EnrichedGoal, Scenario } from "./types";
import { ProgressBar } from "./progress-bar";
import { formatCurrency, progressPercent } from "./utils";

export function GoalCard({
  goal,
  scenario,
  onEdit,
  onRequestDelete,
}: {
  goal: EnrichedGoal;
  scenario: Scenario | null;
  onEdit: (goalId: string) => void;
  onRequestDelete: (goal: EnrichedGoal) => void;
}) {
  const baseProgress = progressPercent(goal.current, goal.target);
  const remaining = Math.max(0, goal.target - goal.current);

  const adjustedMonthly = React.useMemo(() => {
    if (!scenario || goal.completed) return goal.monthlyContributionNeeded;
    const realFactor =
      (1 + scenario.monthlyReturnRate) / (1 + scenario.inflationRate / 12);
    return Math.round(goal.monthlyContributionNeeded / realFactor);
  }, [scenario, goal]);

  return (
    <DashCard
      className={cn(
        "group relative flex flex-col overflow-hidden",
        goal.completed && "border-emerald-500/30",
      )}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Header: title + progress % + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[15px] font-semibold leading-5 text-foreground"
              title={goal.title}
            >
              {goal.title}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Goal: {formatCurrency(goal.target)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {goal.completed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Done
              </span>
            ) : (
              <span className="text-[13px] font-semibold tabular-nums text-foreground">
                {Math.round(baseProgress)}%
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted/60"
              onClick={() => onEdit(goal.id)}
              aria-label="Edit goal"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRequestDelete(goal)}
              aria-label="Delete goal"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar value={baseProgress} />

        {/* Stats row */}
        {goal.completed ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-[12px] text-emerald-800">
              Target reached - well done.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Wallet className="h-3 w-3" />
                Saved
              </div>
              <div className="mt-0.5 text-[13px] font-medium tabular-nums">
                {formatCurrency(goal.current)}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {goal.targetDate ? "Due" : "Remaining"}
              </div>
              <div className="mt-0.5 text-[13px] font-medium tabular-nums">
                {goal.targetDate ?? formatCurrency(remaining)}
              </div>
            </div>
          </div>
        )}

        {/* Monthly needed */}
        {!goal.completed && (
          <div className="mt-auto border-t pt-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-muted-foreground">
                Monthly needed
              </span>
              <span className="text-[13px] font-semibold tabular-nums">
                {formatCurrency(adjustedMonthly)}
                <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
                  /mo
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </DashCard>
  );
}
