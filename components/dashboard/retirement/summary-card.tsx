"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

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
  accent?: "good" | "bad";
  hint?: string;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl bg-muted/30 p-4",
        accent === "good" ? "bg-emerald-50/60 dark:bg-emerald-950/20" : "",
        accent === "bad" ? "bg-red-50/60 dark:bg-red-950/20" : "",
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          accent === "good" ? "text-emerald-700 dark:text-emerald-500" : "",
          accent === "bad" ? "text-red-700 dark:text-red-500" : "",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground/80 leading-snug">
          {hint}
        </div>
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
        {/* How-it-works banner */}
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/40 dark:border-blue-800/30 px-4 py-3">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-xs leading-relaxed text-blue-800 dark:text-blue-300">
            <span className="font-medium">How this works:</span> We take your
            current savings + pension, add your monthly contributions, and grow
            everything at your expected return rate until retirement. Then we
            compare that total to the nest egg you&apos;d need to safely
            withdraw your desired monthly income (adjusted for inflation).
          </div>
        </div>

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
            hint="What your savings + pension could grow to by retirement."
          />
          <MiniKpi
            label="Required Amount"
            value={formatCurrency(Math.round(requiredAmount))}
            hint="The lump sum needed to fund your desired retirement income."
          />
          <MiniKpi
            label="Projected Surplus"
            value={formatCurrency(Math.round(projectedSurplus))}
            accent={projectedSurplus >= 0 ? "good" : "bad"}
            hint={
              projectedSurplus >= 0
                ? "You're projected to have more than enough."
                : "The gap between what you'll have and what you need."
            }
          />
          <MiniKpi
            label="Monthly Income Goal"
            value={formatCurrency(active.desiredMonthlyIncome)}
            hint="What you want per month in retirement, in today's dollars."
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
