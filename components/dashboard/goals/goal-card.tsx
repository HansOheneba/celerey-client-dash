import React from "react";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2 } from "lucide-react";

import { DashCard, CardContent } from "@/components/dashboard/dash-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GOAL_CATEGORY_META } from "@/lib/client-data";

import { EnrichedGoal, Scenario } from "./types";
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
  const meta = GOAL_CATEGORY_META[goal.category];

  return (
    <DashCard
      className={cn("group relative flex flex-col overflow-hidden py-0")}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Pill + actions */}
        <div className="flex items-start justify-between gap-2">
          {goal.completed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {goal.title}
            </span>
          ) : (
            <span
              className="max-w-[72%] truncate rounded-full px-3 py-1 text-[13px] font-semibold text-white"
              style={{ backgroundColor: meta.color }}
              title={goal.title}
            >
              {goal.title}
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted/60"
                aria-label="Goal options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onEdit(goal.id)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRequestDelete(goal)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Target date */}
        <p className="text-[12px] text-muted-foreground">
          {goal.targetDate
            ? `Target date: ${goal.targetDate}`
            : `${goal.yearsRemaining} year${goal.yearsRemaining !== 1 ? "s" : ""} remaining`}
        </p>

        {/* Amounts row */}
        <div className="flex items-baseline justify-between">
          <span className="text-[20px] font-semibold tabular-nums text-foreground">
            {formatCurrency(goal.current)}
          </span>
          <span className="text-[15px] font-semibold tabular-nums text-foreground">
            {formatCurrency(goal.target)}
          </span>
        </div>

        {/* Progress bar - color matched to category */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${baseProgress}%`, backgroundColor: meta.color }}
          />
        </div>

        {/* Footer */}
        {goal.completed ? (
          <p className="text-[12px] font-medium text-emerald-600">
            Target reached.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">
                {Math.round(baseProgress)}% completed
              </span>
              <span className="tabular-nums text-[12px] text-muted-foreground">
                {formatCurrency(remaining)} to go
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-2">
              <span className="text-[11px] text-muted-foreground">
                Likelihood of acheivement
              </span>
              <span
                className={cn(
                  "text-[12px] font-semibold tabular-nums",
                  goal.probability >= 75
                    ? "text-emerald-600"
                    : goal.probability >= 50
                      ? "text-amber-500"
                      : "text-red-500",
                )}
              >
                {goal.probability}%
              </span>
            </div>
          </>
        )}
      </CardContent>
    </DashCard>
  );
}
