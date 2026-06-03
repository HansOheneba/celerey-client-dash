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

/* ---------------------------
   BRAND SYSTEM
---------------------------- */
const brand = {
  primary: "rgb(27 24 86)",
  accent: "rgb(140 128 248)",
  soft: "rgba(140, 128, 248, 0.10)",
  border: "rgba(27, 24, 86, 0.10)",
};

/* ---------------------------
   PRIORITY
---------------------------- */
const PRIORITY_META: Record<number, { label: string; className: string }> = {
  1: {
    label: "#1",
    className:
      "bg-[rgba(27,24,86,0.08)] text-[rgb(27,24,86)] ring-1 ring-[rgba(27,24,86,0.15)]",
  },
  2: {
    label: "#2",
    className:
      "bg-[rgba(140,128,248,0.10)] text-[rgb(27,24,86)] ring-1 ring-[rgba(140,128,248,0.20)]",
  },
  3: {
    label: "#3",
    className: "bg-muted/40 text-muted-foreground ring-1 ring-border",
  },
};

function getPriorityMeta(priority: number) {
  return (
    PRIORITY_META[priority] ?? {
      label: `P${priority}`,
      className: "bg-muted/40 text-muted-foreground ring-1 ring-border",
    }
  );
}

/* ---------------------------
   HEALTH (soft + unified)
---------------------------- */
const HEALTH_META = {
  "on-track": {
    label: "On Track",
    Icon: TrendingUp,
  },
  "at-risk": {
    label: "At Risk",
    Icon: AlertTriangle,
  },
  "off-track": {
    label: "Needs Focus",
    Icon: XCircle,
  },
};

const HEALTH_TONE = {
  "on-track": {
    bg: "rgba(140,128,248,0.10)",
    border: "rgba(140,128,248,0.25)",
    text: brand.primary,
  },
  "at-risk": {
    bg: "rgba(140,128,248,0.14)",
    border: "rgba(140,128,248,0.30)",
    text: brand.primary,
  },
  "off-track": {
    bg: "rgba(27,24,86,0.06)",
    border: "rgba(27,24,86,0.15)",
    text: brand.primary,
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
  const tone = HEALTH_TONE[health];

  const priorityMeta = getPriorityMeta(goal.priority);

  return (
    <DashCard className="group relative flex flex-col overflow-hidden py-0">
      <CardContent className="flex flex-1 flex-col gap-2.5 p-3.5">
        {/* ---------------- ROW 1: title + actions ---------------- */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {goal.completed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(140,128,248,0.12)] px-2.5 py-1 text-[12px] font-medium text-[rgb(27,24,86)] ring-1 ring-[rgba(140,128,248,0.25)] truncate max-w-[75%]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {goal.title}
              </span>
            ) : (
              <span
                className="truncate rounded-full px-2.5 py-1 text-[12px] font-medium text-white max-w-[70%]"
                style={{ backgroundColor: meta.color }}
                title={goal.title}
              >
                {goal.title}
              </span>
            )}

            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
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
                className="h-6 w-6 rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted/60"
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

        {/* ---------------- ROW 2: meta ---------------- */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {categoryLabel}
          </span>

          {timeRemaining && (
            <span className="text-[10px] text-muted-foreground">
              {timeRemaining}
            </span>
          )}
        </div>

        {/* ---------------- ROW 3: amounts ---------------- */}
        <div className="flex items-baseline justify-between">
          <div>
            <p
              className="text-[18px] font-semibold tabular-nums leading-tight"
              style={{ color: brand.primary }}
            >
              {formatCurrency(goal.current)}
            </p>
            <p className="text-[10px] text-muted-foreground">saved</p>
          </div>

          <div className="text-right">
            <p
              className="text-[14px] font-semibold tabular-nums leading-tight"
              style={{ color: brand.primary }}
            >
              {formatCurrency(goal.target)}
            </p>
            <p className="text-[10px] text-muted-foreground">target</p>
          </div>
        </div>

        {/* ---------------- ROW 4: progress ---------------- */}
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${baseProgress}%`,
                backgroundColor: "rgb(140 128 248)",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {Math.round(baseProgress)}% funded
            </span>

            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatCurrency(remaining)} left
            </span>
          </div>
        </div>

        {/* ---------------- ROW 5: health ---------------- */}
        {goal.completed ? (
          <p
            className="text-[11px] font-medium pt-1"
            style={{ color: "rgb(140 128 248)" }}
          >
            Target reached
          </p>
        ) : (
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: tone.bg,
                border: `1px solid ${tone.border}`,
                color: tone.text,
              }}
            >
              <HealthIcon className="h-3 w-3" />
              {healthMeta.label}
            </span>

            {goal.monthlyContributionNeeded > 0 && (
              <div className="text-right">
                <p
                  className="text-[12px] font-semibold tabular-nums"
                  style={{ color: brand.primary }}
                >
                  {formatCurrency(Math.round(goal.monthlyContributionNeeded))}
                  <span className="text-[10px] text-muted-foreground">/mo</span>
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
