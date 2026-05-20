import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/client-data";
import type { ApiCashFlowSummary } from "@/lib/dashboard-api";

type InsightEntry = {
  key: string;
  title: string;
  body: string;
  colorClass: string;
  icon: React.ElementType;
};

function deriveCards(summary: ApiCashFlowSummary): InsightEntry[] {
  const cards: InsightEntry[] = [];
  const inputs = summary.insights_inputs;
  const averages = summary.averages;
  const ef = summary.emergency_fund;
  const mom = summary.month_over_month;

  if (!inputs) return cards;

  // Savings rate card
  if (inputs.savingsRate >= 30) {
    cards.push({
      key: "sr",
      title: "Excellent savings rate",
      body: `You're saving ${inputs.savingsRate.toFixed(0)}% of your income - well above the 20% benchmark. Your monthly surplus of ${formatCurrency(inputs.surplus)} compounds meaningfully over time.`,
      colorClass: "border-emerald-200/60 bg-emerald-50/60",
      icon: TrendingUp,
    });
  } else if (inputs.savingsRate >= 20) {
    cards.push({
      key: "sr",
      title: "Healthy savings rate",
      body: `At ${inputs.savingsRate.toFixed(0)}%, you're above the 20% threshold. Pushing toward 30% would accelerate your wealth-building pace.`,
      colorClass: "border-sky-200/60 bg-sky-50/60",
      icon: TrendingUp,
    });
  } else if (inputs.savingsRate > 0) {
    cards.push({
      key: "sr",
      title: "Savings rate below target",
      body: `Your ${inputs.savingsRate.toFixed(0)}% savings rate is below the 20% benchmark. Cutting expenses by ${formatCurrency(inputs.totalIncome * 0.2 - inputs.surplus)}/mo would close the gap.`,
      colorClass: "border-amber-200/60 bg-amber-50/60",
      icon: AlertCircle,
    });
  }

  // Burn rate card
  if (inputs.burnRate <= 30) {
    cards.push({
      key: "burn",
      title: "Low burn rate",
      body: `You're only spending ${inputs.burnRate.toFixed(0)}% of your income. This leaves strong headroom for investing or accelerating your goals.`,
      colorClass: "border-emerald-200/60 bg-emerald-50/60",
      icon: ShieldCheck,
    });
  } else if (inputs.burnRate >= 80) {
    cards.push({
      key: "burn",
      title: "High burn rate",
      body: `At ${inputs.burnRate.toFixed(0)}% of income spent, there is little room for unexpected costs. Review discretionary expenses to build a buffer.`,
      colorClass: "border-red-200/60 bg-red-50/60",
      icon: AlertCircle,
    });
  }

  // Month-over-month income change
  if (mom && mom.incomeChange_pct > 5) {
    cards.push({
      key: "mom-inc",
      title: "Income trending up",
      body: `Income grew ${mom.incomeChange_pct.toFixed(1)}% vs last month. Consider directing part of the increase into investments to avoid lifestyle inflation.`,
      colorClass: "border-emerald-200/60 bg-emerald-50/60",
      icon: TrendingUp,
    });
  } else if (mom && mom.expenseChange_pct > 10) {
    cards.push({
      key: "mom-exp",
      title: "Expense spike detected",
      body: `Expenses rose ${mom.expenseChange_pct.toFixed(1)}% vs last month. Review recent transactions to determine if this is a one-off or a new recurring cost.`,
      colorClass: "border-amber-200/60 bg-amber-50/60",
      icon: TrendingDown,
    });
  }

  // Emergency fund card
  if (ef) {
    if (ef.funded_pct >= 100) {
      cards.push({
        key: "ef",
        title: "Emergency fund fully covered",
        body: `Your ${formatCurrency(ef.current_cash_balance)} cash balance covers ${ef.runway_months.toFixed(1)} months of expenses - meeting your ${ef.target_months}-month target.`,
        colorClass: "border-emerald-200/60 bg-emerald-50/60",
        icon: ShieldCheck,
      });
    } else if (ef.shortfall > 0) {
      cards.push({
        key: "ef",
        title: "Emergency fund shortfall",
        body: `You're ${formatCurrency(ef.shortfall)} short of your ${ef.target_months}-month emergency target. Your current balance covers ${ef.runway_months.toFixed(1)} months.`,
        colorClass: "border-amber-200/60 bg-amber-50/60",
        icon: AlertCircle,
      });
    }
  }

  // Averages comparison
  if (averages && averages.based_on_months >= 2) {
    const diff = inputs.surplus - averages.avgMonthlySurplus;
    if (Math.abs(diff) > 100) {
      cards.push({
        key: "avg",
        title:
          diff >= 0
            ? "Above your average surplus"
            : "Below your average surplus",
        body: `Your current surplus of ${formatCurrency(inputs.surplus)} is ${formatCurrency(Math.abs(diff))} ${diff >= 0 ? "above" : "below"} your ${averages.based_on_months}-month average of ${formatCurrency(averages.avgMonthlySurplus)}.`,
        colorClass:
          diff >= 0
            ? "border-sky-200/60 bg-sky-50/60"
            : "border-amber-200/60 bg-amber-50/60",
        icon: diff >= 0 ? TrendingUp : TrendingDown,
      });
    }
  }

  return cards;
}

export function CelereyInsights({
  summary,
}: {
  summary: ApiCashFlowSummary | null;
}) {
  const cards = summary ? deriveCards(summary) : [];

  if (!summary) return null;

  return (
    <DashCard className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Celerey Cash Flow Insights</CardTitle>
        <Badge variant="secondary" className="gap-1">
          <Lightbulb className="h-3.5 w-3.5" />
          Insights
        </Badge>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full">
            No insights available yet. Add income and expenses to get
            personalised analysis.
          </p>
        ) : (
          cards.map((card) => (
            <div
              key={card.key}
              className={`rounded-xl border p-4 ${card.colorClass}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <card.icon className="h-3.5 w-3.5 opacity-70" />
                <div className="text-sm font-semibold">{card.title}</div>
              </div>
              <div className="text-sm text-muted-foreground">{card.body}</div>
            </div>
          ))
        )}
      </CardContent>
    </DashCard>
  );
}
