"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  StatusTone,
  AdjustmentRecommendations,
} from "@/components/dashboard/retirement/types";
import { clamp, formatCurrency } from "@/components/dashboard/retirement/utils";

function ProgressBar({
  value,
  good = true,
  reduceMotion,
}: {
  value: number;
  good?: boolean;
  reduceMotion: boolean;
}) {
  const safe = clamp(value, 0, 200);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn(
          "h-full rounded-full",
          good ? "bg-emerald-600" : "bg-amber-600",
        )}
        initial={false}
        animate={{ width: `${safe / 2}%` }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
      />
    </div>
  );
}

type ReadinessCardProps = {
  fundedPct: number;
  status: StatusTone;
  simulationMode: boolean;
  projectedSurplus: number;
  reduceMotion: boolean;
  adjustments?: AdjustmentRecommendations;
};

export function ReadinessCard({
  fundedPct,
  status,
  simulationMode,
  projectedSurplus,
  reduceMotion,
  adjustments,
}: ReadinessCardProps) {
  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Retirement Readiness</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              How close you are to having enough saved for your retirement
              income goal.
            </p>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {fundedPct.toFixed(0)}% funded
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <ProgressBar
            value={fundedPct}
            good={fundedPct >= 100}
            reduceMotion={reduceMotion}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {simulationMode ? "Simulated trajectory" : "Current trajectory"}
            </span>
            <span className="tabular-nums">{fundedPct.toFixed(0)}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground/80 leading-snug">
            {fundedPct >= 100
              ? "100% means your projected nest egg fully covers your retirement income target."
              : `At ${fundedPct.toFixed(0)}%, you're projected to accumulate ${(100 - fundedPct).toFixed(0)}% less than what's needed for your target monthly income.`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${status.tone}-${Math.round(fundedPct)}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className={cn(
              "rounded-xl border p-4",
              status.tone === "good"
                ? "border-emerald-200/60 bg-emerald-50/60"
                : "border-amber-200/60 bg-amber-50/60",
            )}
          >
            <div
              className={cn(
                "text-sm font-semibold",
                status.tone === "good" ? "text-emerald-900" : "text-amber-900",
              )}
            >
              {status.title}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
              Projections show{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(Math.abs(Math.round(projectedSurplus)))}
              </span>{" "}
              {projectedSurplus >= 0 ? "above" : "below"} your target.
            </div>
          </motion.div>
        </AnimatePresence>

        {adjustments && fundedPct < 100 && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className="rounded-xl border border-blue-200/60 bg-blue-50/60 dark:border-blue-800/40 dark:bg-blue-950/20 p-4 space-y-3"
            >
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Ways to close the gap
              </div>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 leading-snug">
                You don&apos;t need to do all of these — any single change (or
                combination) can get you to 100%.
              </p>

              <div className="space-y-2 text-sm">
                {adjustments.monthlySavingsIncrease > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">
                      •
                    </span>
                    <span className="text-muted-foreground">
                      Save an extra{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(adjustments.monthlySavingsIncrease)}
                      </span>{" "}
                      per month
                    </span>
                  </div>
                )}

                {adjustments.retirementAgeDelay > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">
                      •
                    </span>
                    <span className="text-muted-foreground">
                      Retire{" "}
                      <span className="font-medium text-foreground">
                        {adjustments.retirementAgeDelay.toFixed(1)} years
                      </span>{" "}
                      later — more time to save &amp; earn returns
                    </span>
                  </div>
                )}

                {adjustments.monthlyIncomeReduction > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">
                      •
                    </span>
                    <span className="text-muted-foreground">
                      Lower your monthly income target by{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(adjustments.monthlyIncomeReduction)}
                      </span>
                    </span>
                  </div>
                )}

                {adjustments.currentInvestmentBoost > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">
                      •
                    </span>
                    <span className="text-muted-foreground">
                      Make a one-time investment of{" "}
                      <span className="font-medium text-foreground">
                        {formatCurrency(adjustments.currentInvestmentBoost)}
                      </span>{" "}
                      today
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-muted/30 p-4">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            These projections use compound growth with monthly contributions.
            Actual returns will vary. Use the simulation mode to stress-test
            different scenarios and find a plan that feels right.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
