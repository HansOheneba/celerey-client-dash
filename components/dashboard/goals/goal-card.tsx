import React from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import { DashCard, CardContent } from "@/components/dashboard/dash-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GOAL_CATEGORY_META, GOAL_CATEGORY_OPTIONS } from "@/lib/client-data";

import { EnrichedGoal, Scenario } from "./types";
import {
  formatCurrency,
  progressPercent,
  formatTimeRemaining,
  goalHealth,
} from "./utils";

const PRIORITY_META: Record<number, { label: string; className: string }> = {
  1: {
    label: "#1",
    className: "text-foreground",
  },
  2: {
    label: "#2",
    className: "text-muted-foreground",
  },
  3: {
    label: "#3",
    className: "text-muted-foreground/70",
  },
};

function getPriorityMeta(priority: number) {
  return (
    PRIORITY_META[priority] ?? {
      label: `P${priority}`,
      className: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    }
  );
}

const HEALTH_META = {
  "on-track": {
    label: "On Track",
    Icon: TrendingUp,
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  "at-risk": {
    label: "At Risk",
    Icon: AlertTriangle,
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  "off-track": {
    label: "Off Track",
    Icon: XCircle,
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
};

export function GoalCard({
  goal,
  onEdit,
  onRequestDelete,
}: {
  goal: EnrichedGoal;
  scenario?: Scenario | null;
  onEdit: (goalId: string) => void;
  onRequestDelete: (goal: EnrichedGoal) => void;
}) {
  const baseProgress = progressPercent(goal.current, goal.target);
  const remaining = Math.max(0, goal.target - goal.current);
  const meta = GOAL_CATEGORY_META[goal.category];
  const categoryLabel =
    GOAL_CATEGORY_OPTIONS.find((o) => o.value === goal.category)?.label ??
    "Other";
  const timeRemaining = formatTimeRemaining(goal.targetDate);
  const health = goalHealth(goal.probability);
  const healthMeta = HEALTH_META[health];
  const HealthIcon = healthMeta.Icon;
  const priorityMeta = getPriorityMeta(goal.priority);

  return (
    <DashCard
      className={cn("group relative flex flex-col overflow-hidden py-0")}
    >
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Row 1: title pill + priority badge + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {goal.completed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-semibold text-emerald-700 ring-1 ring-emerald-200 truncate max-w-[80%]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {goal.title}
              </span>
            ) : (
              <span
                className="truncate rounded-full px-3 py-1 text-[13px] font-semibold text-white max-w-[72%]"
                style={{ backgroundColor: meta.color }}
                title={goal.title}
              >
                {goal.title}
              </span>
            )}
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                priorityMeta.className,
              )}
            >
              {priorityMeta.label}
            </span>
          </div>

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

        {/* Row 2: category + time remaining */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {categoryLabel}
          </span>
          {timeRemaining && (
            <span className="text-[11px] text-muted-foreground">
              {timeRemaining}
            </span>
          )}
        </div>

        {/* Row 3: amounts */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[20px] font-semibold tabular-nums text-foreground leading-tight">
              {formatCurrency(goal.current)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">saved</p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold tabular-nums text-foreground leading-tight">
              {formatCurrency(goal.target)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">target</p>
          </div>
        </div>

        {/* Row 4: progress bar */}
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${baseProgress}%`, backgroundColor: meta.color }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {Math.round(baseProgress)}% funded
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatCurrency(remaining)} to go
            </span>
          </div>
        </div>

        {/* Row 5: health + monthly contribution */}
        {goal.completed ? (
          <p className="text-[12px] font-medium text-emerald-600 pt-1">
            Target reached.
          </p>
        ) : (
          <div className="flex items-center justify-between border-t border-border/50 pt-2.5 gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                healthMeta.className,
              )}
            >
              <HealthIcon className="h-3 w-3 shrink-0" />
              {healthMeta.label}
            </span>
            {goal.monthlyContributionNeeded > 0 && (
              <div className="text-right">
                <p className="text-[13px] font-bold tabular-nums text-foreground leading-tight">
                  {formatCurrency(Math.round(goal.monthlyContributionNeeded))}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">needed</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </DashCard>
  );
}
