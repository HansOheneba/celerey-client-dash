import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Target,
} from "lucide-react";

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

import { EnrichedGoal, Scenario } from "./types";
import { ProgressBar } from "./progress-bar";
import {
  clamp,
  formatCurrency,
  progressPercent,
  probabilityTone,
} from "./utils";

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

  const adjustedMonthly =
    scenario && !goal.completed
      ? Math.round(goal.monthlyContributionNeeded * scenario.monthlyMultiplier)
      : goal.monthlyContributionNeeded;

  const adjustedProb =
    scenario && !goal.completed
      ? clamp(goal.probability + scenario.probabilityDelta, 0, 100)
      : goal.probability;

  const completedLabel = goal.completedDate
    ? `Completed ${goal.completedDate}`
    : "Completed recently";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-muted/60 bg-background/70 shadow-sm transition-all",
        " hover:shadow-md",
        goal.completed &&
          cn(
            "border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.12] via-background/80 to-background/70",
            "shadow-[0_10px_35px_-18px_rgba(16,185,129,0.65)]",
          ),
      )}
    >
      {goal.completed ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,rgba(16,185,129,0.22),transparent_60%)]" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-emerald-400/90 via-emerald-500/40 to-transparent" />
        </>
      ) : null}

      <CardHeader className="relative flex flex-row items-start justify-between gap-3 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle
              className={cn(
                "truncate text-[15px] leading-5",
                goal.completed ? "text-foreground" : "text-foreground",
              )}
              title={goal.title}
            >
              {goal.title}
            </CardTitle>

            {goal.completed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Achieved
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {goal.completed ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {completedLabel}
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {goal.yearsRemaining} year(s) remaining
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {Math.round(baseProgress)}% complete
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!goal.completed ? (
            <Badge
              variant={probabilityTone(adjustedProb)}
              className="font-medium"
            >
              {adjustedProb}% probability
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-600/70 bg-emerald-500/10 font-medium text-emerald-700"
            >
              Milestone hit
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full transition-colors",
                  "hover:bg-muted/70",
                  goal.completed && "hover:bg-emerald-500/10",
                )}
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

      <CardContent className="relative space-y-5 pt-0">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="tabular-nums font-medium">
              {Math.round(baseProgress)}%
            </span>
          </div>

          <div
            className={cn(
              "rounded-full p-1",
              goal.completed && "bg-emerald-500/10",
            )}
          >
            <ProgressBar value={baseProgress} />
          </div>

          {goal.completed ? (
            <p className="text-xs text-emerald-700/90">
              You hit your target, this is a real milestone. Keep going
            </p>
          ) : null}
        </div>

        {/* Current / Target */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              "rounded-xl border bg-muted/30 p-3",
              goal.completed && "border-emerald-500/25 bg-emerald-500/[0.06]",
            )}
          >
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="mt-1 text-[15px] font-semibold tabular-nums">
              {formatCurrency(goal.current)}
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl border bg-muted/30 p-3",
              goal.completed && "border-emerald-500/25 bg-emerald-500/[0.06]",
            )}
          >
            <div className="text-xs text-muted-foreground">Target</div>
            <div className="mt-1 text-[15px] font-semibold tabular-nums">
              {formatCurrency(goal.target)}
            </div>
          </div>
        </div>

        <Separator className={cn(goal.completed && "bg-emerald-500/15")} />

        {/* Monthly / Completed message */}
        {!goal.completed ? (
          <div className="rounded-xl border bg-background/40 p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Monthly contribution needed
              </div>
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(adjustedMonthly)}
              </div>
            </div>

            {scenario ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {scenario.description}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Goal achieved, well done!
                </p>
                <p className="mt-1 text-xs text-emerald-700/80">
                  You stayed consistent and reached your target. This is
                  something to be proud of.
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/15 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
