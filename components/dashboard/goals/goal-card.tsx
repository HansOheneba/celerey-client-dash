import React from "react";
import {
  Pencil,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Target,
  Info,
  Tag,
} from "lucide-react";

import {
  DashCard,
  CardContent,
  CardHeader,
} from "@/components/dashboard/dash-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { EnrichedGoal, Scenario } from "./types";
import { ProgressBar } from "./progress-bar";
import { formatCurrency, progressPercent, probabilityTone } from "./utils";

const CATEGORY_COLORS: Record<
  string,
  { accent: string; dot: string; badge: string; text: string }
> = {
  emergency: {
    accent: "#5DCAA5",
    dot: "#5DCAA5",
    badge: "bg-[#E1F5EE]",
    text: "text-[#085041]",
  },
  retirement: {
    accent: "#7F77DD",
    dot: "#7F77DD",
    badge: "bg-[#EEEDFE]",
    text: "text-[#3C3489]",
  },
  housing: {
    accent: "#7F77DD",
    dot: "#7F77DD",
    badge: "bg-[#EEEDFE]",
    text: "text-[#3C3489]",
  },
  education: {
    accent: "#378ADD",
    dot: "#378ADD",
    badge: "bg-[#E6F1FB]",
    text: "text-[#0C447C]",
  },
  travel: {
    accent: "#EF9F27",
    dot: "#EF9F27",
    badge: "bg-[#FAEEDA]",
    text: "text-[#633806]",
  },
  vehicle: {
    accent: "#888780",
    dot: "#888780",
    badge: "bg-[#F1EFE8]",
    text: "text-[#444441]",
  },
  business: {
    accent: "#D4537E",
    dot: "#D4537E",
    badge: "bg-[#FBEAF0]",
    text: "text-[#72243E]",
  },
  other: {
    accent: "#888780",
    dot: "#888780",
    badge: "bg-[#F1EFE8]",
    text: "text-[#444441]",
  },
};

const PROB_STYLES = {
  high: { badge: "bg-[#E1F5EE]", text: "text-[#085041]" },
  medium: { badge: "bg-[#FAEEDA]", text: "text-[#633806]" },
  low: { badge: "bg-[#FCEBEB]", text: "text-[#791F1F]" },
};

function getProbStyle(prob: number) {
  if (prob >= 70) return PROB_STYLES.high;
  if (prob >= 40) return PROB_STYLES.medium;
  return PROB_STYLES.low;
}

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
  const colors = CATEGORY_COLORS[goal.category] ?? CATEGORY_COLORS.other;

  const adjustedMonthly = React.useMemo(() => {
    if (!scenario || goal.completed) return goal.monthlyContributionNeeded;
    const realFactor =
      (1 + scenario.monthlyReturnRate) / (1 + scenario.inflationRate / 12);
    return Math.round(goal.monthlyContributionNeeded / realFactor);
  }, [scenario, goal]);

  const probStyle = getProbStyle(goal.probability);

  const completedLabel = goal.completedDate
    ? `Completed ${goal.completedDate}`
    : "Completed recently";

  return (
    <DashCard
      className={cn(
        "group relative overflow-hidden transition-all",
        goal.completed && "border-emerald-500/30",
      )}
    >
      {/* Color accent bar */}
      <div
        className="h-[3px] w-full"
        style={{ background: goal.completed ? "#1D9E75" : colors.accent }}
      />

      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-2 pt-3">
        {/* Left: dot + title + meta row */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: goal.completed ? "#1D9E75" : colors.accent }}
            />
            <span
              className="truncate text-[14px] font-medium leading-5 text-foreground"
              title={goal.title}
            >
              {goal.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* Category badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                goal.completed
                  ? "bg-[#E1F5EE] text-[#085041]"
                  : cn(colors.badge, colors.text),
              )}
            >
              <Tag className="h-2.5 w-2.5" />
              {goal.category}
            </span>

            <span className="text-[11px] text-muted-foreground">
              Priority #{goal.priority}
            </span>

            {goal.completed ? (
              <span className="text-[11px] text-muted-foreground">
                {completedLabel}
              </span>
            ) : (
              <>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  ·
                </span>
                <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {goal.yearsRemaining}y left
                </span>
              </>
            )}
          </div>

          {goal.description ? (
            <p className="line-clamp-1 text-[11px] text-muted-foreground">
              {goal.description}
            </p>
          ) : null}
        </div>

        {/* Right: probability badge + actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {!goal.completed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "inline-flex cursor-default items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      probStyle.badge,
                      probStyle.text,
                    )}
                  >
                    {goal.probability}%
                    <Info className="h-3 w-3 shrink-0 opacity-60" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs leading-relaxed">
                  Probability of reaching this goal based on your cash flow and
                  timeline.
                  {scenario ? ` Viewing under "${scenario.label}".` : ""}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E1F5EE] px-2 py-0.5 text-[11px] font-medium text-[#085041]">
              <CheckCircle2 className="h-3 w-3" />
              Achieved
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted/60"
            onClick={() => onEdit(goal.id)}
            aria-label="Edit goal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRequestDelete(goal)}
            aria-label="Delete goal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={baseProgress} />
          </div>
          <span className="w-9 shrink-0 text-right text-[11px] font-medium tabular-nums text-muted-foreground">
            {Math.round(baseProgress)}%
          </span>
        </div>

        {/* Current / Target */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className={cn(
              "rounded-lg border bg-muted/30 px-3 py-2",
              goal.completed && "border-emerald-500/20 bg-[#E1F5EE]/40",
            )}
          >
            <div className="text-[11px] text-muted-foreground">Saved</div>
            <div className="mt-0.5 text-[13px] font-medium tabular-nums">
              {formatCurrency(goal.current)}
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg border bg-muted/30 px-3 py-2",
              goal.completed && "border-emerald-500/20 bg-[#E1F5EE]/40",
            )}
          >
            <div className="text-[11px] text-muted-foreground">Target</div>
            <div className="mt-0.5 text-[13px] font-medium tabular-nums">
              {formatCurrency(goal.target)}
            </div>
          </div>
        </div>

        {/* Footer row */}
        {!goal.completed ? (
          <div className="flex items-center justify-between rounded-lg border bg-background/40 px-3 py-2">
            <div>
              <div className="text-[11px] text-muted-foreground">
                Monthly needed
              </div>
              <div className="text-[13px] font-medium tabular-nums">
                {formatCurrency(adjustedMonthly)}
                <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                  / mo
                </span>
              </div>
            </div>
            {scenario ? (
              <span className="text-[11px] text-muted-foreground">
                {scenario.label}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-[#E1F5EE] px-3 py-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F6E56]" />
            <p className="text-[12px] text-[#085041]">
              You hit your target — this is something to be proud of. Keep
              going.
            </p>
          </div>
        )}
      </CardContent>
    </DashCard>
  );
}
