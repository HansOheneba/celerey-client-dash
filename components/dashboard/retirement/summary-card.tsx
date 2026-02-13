"use client";

import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProjectionInputs } from "@/components/dashboard/retirement/types";
import { formatCurrency } from "@/components/dashboard/retirement/utils";

function MiniKpi({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent?: "good";
  hint?: string;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl bg-muted/30 p-4",
        accent === "good" ? "bg-emerald-50/60" : "",
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          accent === "good" ? "text-emerald-700 dark:text-emerald-500" : "",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </motion.div>
  );
}

type SummaryCardProps = {
  active: ProjectionInputs;
  yearsToRetirement: number;
  projectedNestEgg: number;
  requiredAmount: number;
  projectedSurplus: number;
};

export function SummaryCard({
  active,
  yearsToRetirement,
  projectedNestEgg,
  requiredAmount,
  projectedSurplus,
}: SummaryCardProps) {
  return (
    <Card className="mt-6 border-muted/60 bg-background/60 shadow-sm">
      <CardContent className="p-6">
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center"
        >
          <motion.div
            layout
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl bg-muted/30 p-5"
          >
            <div className="text-xs text-muted-foreground">
              Retirement Target Age
            </div>
            <div className="mt-1 text-5xl font-semibold tabular-nums">
              {active.retirementAge}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {yearsToRetirement} years from now
            </div>
          </motion.div>

          <MiniKpi
            label="Projected Nest Egg"
            value={formatCurrency(Math.round(projectedNestEgg))}
          />
          <MiniKpi
            label="Required Amount"
            value={formatCurrency(Math.round(requiredAmount))}
          />
          <MiniKpi
            label="Projected Surplus"
            value={formatCurrency(Math.round(projectedSurplus))}
            accent={projectedSurplus >= 0 ? "good" : undefined}
          />
          <MiniKpi
            label="Monthly Income"
            value={formatCurrency(active.desiredMonthlyIncome)}
            hint="Target in today's dollars"
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
