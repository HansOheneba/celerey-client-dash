"use client";

import * as React from "react";
import { Flame, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { formatCurrency, type CashFlowPoint } from "@/lib/client-data";

// ─── Types ─────────────────────────────────────────────────────────────────

export type InsightLevel = "good" | "warning" | "danger" | "info";
export type Insight = {
  id: string;
  level: InsightLevel;
  title: string;
  body: string;
};

// ─── Helpers (exported so the page can use them in deriveInsights) ─────────

export function burnRate(expenses: number, income: number): number {
  if (income <= 0) return 100;
  return Math.min((expenses / income) * 100, 100);
}

export function momChange(
  history: CashFlowPoint[],
  key: "income" | "expenses",
): number | null {
  const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month));
  if (sorted.length < 2) return null;
  const prev = sorted[sorted.length - 2][key];
  const curr = sorted[sorted.length - 1][key];
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

// ─── Insight Engine ────────────────────────────────────────────────────────

export function deriveInsights(
  totalIncome: number,
  totalExpenses: number,
  savingsRate: number,
  history: CashFlowPoint[],
): Insight[] {
  const insights: Insight[] = [];
  const surplus = totalIncome - totalExpenses;
  const burn = burnRate(totalExpenses, totalIncome);
  const incMom = momChange(history, "income");
  const expMom = momChange(history, "expenses");

  if (savingsRate >= 30) {
    insights.push({
      id: "sr-great",
      level: "good",
      title: "Excellent savings discipline",
      body: `You're saving ${savingsRate.toFixed(1)}% of your income - well above the 20% benchmark. Your surplus of ${formatCurrency(surplus)}/mo compounds meaningfully over time.`,
    });
  } else if (savingsRate >= 20) {
    insights.push({
      id: "sr-ok",
      level: "info",
      title: "Healthy savings rate",
      body: `At ${savingsRate.toFixed(1)}%, you're saving above the recommended 20% threshold. Aim for 30%+ to accelerate wealth building.`,
    });
  } else if (savingsRate > 0) {
    insights.push({
      id: "sr-low",
      level: "warning",
      title: "Savings rate below target",
      body: `Your ${savingsRate.toFixed(1)}% savings rate is below the 20% benchmark. Reducing discretionary spending by ${formatCurrency(totalIncome * 0.2 - surplus)}/mo would hit the target.`,
    });
  }

  if (burn > 90) {
    insights.push({
      id: "burn-high",
      level: "danger",
      title: "High burn rate - low runway",
      body: `You're spending ${burn.toFixed(0)}% of income. Any income disruption leaves almost no buffer. Prioritise building an emergency fund before increasing discretionary spend.`,
    });
  }

  if (incMom !== null && incMom > 5) {
    insights.push({
      id: "inc-up",
      level: "good",
      title: "Income trending up",
      body: `Your income grew ${incMom.toFixed(1)}% month-over-month. Consider allocating a portion of this increase directly to investments to avoid lifestyle inflation.`,
    });
  }

  if (expMom !== null && expMom > 10) {
    insights.push({
      id: "exp-spike",
      level: "warning",
      title: "Expense spike detected",
      body: `Expenses rose ${expMom.toFixed(1)}% last month. Review your recent transactions to identify if this is one-off or a recurring pattern.`,
    });
  }

  if (totalExpenses > totalIncome) {
    insights.push({
      id: "deficit",
      level: "danger",
      title: "Monthly deficit",
      body: `You're spending ${formatCurrency(Math.abs(surplus))} more than you earn. At this rate, you'd draw down savings by ${formatCurrency(Math.abs(surplus) * 12)}/year.`,
    });
  }

  return insights.slice(0, 4);
}

// ─── Insight Card ──────────────────────────────────────────────────────────

export function InsightCard({ insight }: { insight: Insight }) {
  const config: Record<
    InsightLevel,
    { icon: React.ReactNode; bg: string; border: string; text: string }
  > = {
    good: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300",
    },
    danger: {
      icon: <Flame className="h-4 w-4 text-red-500" />,
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-300",
    },
    info: {
      icon: <Info className="h-4 w-4 text-blue-500" />,
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
    },
  };
  const c = config[insight.level];
  return (
    <div className={`rounded-lg border p-3 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{c.icon}</div>
        <div>
          <p className={`text-xs font-semibold ${c.text}`}>{insight.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  );
}
