"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
  Repeat2,
  CalendarClock,
  Flame,
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PiggyBank,
  CreditCard,
  Banknote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Cell,
  ReferenceLine,
} from "recharts";

import { KpiStrip, type KpiItem } from "@/components/dashboard/kpi-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  RowItem,
  type MoneyRow,
} from "@/components/dashboard/cash-flow/row-item";
import { SettingsDialog } from "@/components/dashboard/cash-flow/settings-dialog";
import { CelereyInsights } from "@/components/dashboard/cash-flow/celerey-insights";
import { NetWorthCard } from "@/components/dashboard/cash-flow/net-worth-card";
import {
  DeleteConfirmDialog,
  type EditMode,
  type DeleteTarget,
} from "@/components/dashboard/cash-flow/delete-confirm-dialog";
import { CashFlowChart } from "@/components/dashboard/cash-flow/cash-flow-chart";

import { useRouter } from "next/navigation";
import {
  calculateNetWorth,
  selectEmergencyFundMetrics,
  formatCurrency,
  type CashFlowPoint,
  type CashFlowRow,
  type ExpenseCategory,
  type CashFlowEntryDraft,
  type RecurringType,
  type CashFlowSettings,
  type FinancialDomainData,
} from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import {
  createIncome,
  updateIncome,
  deleteIncome,
  createExpense,
  updateExpense,
  deleteExpense,
  updateEmergencyFund,
  fetchCashFlowSummary,
} from "@/lib/dashboard-api";
import { usePageData } from "@/hooks/usePageData";
import { toast } from "sonner";
import { DateInput } from "@/components/ui/date-input";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Local-only types ──────────────────────────────────────────────────────

type RowMode = "create" | "edit";
type InsightLevel = "good" | "warning" | "danger" | "info";
type Insight = { id: string; level: InsightLevel; title: string; body: string };

// ─── Constants ─────────────────────────────────────────────────────────────

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Rental",
  "Dividends",
  "Business",
  "Pension",
  "Other",
];
const EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Transport",
  "Healthcare",
  "Entertainment",
  "Utilities",
  "Education",
  "Insurance",
  "Other",
];

const surplusChartConfig = {
  surplus: { label: "Surplus", color: "var(--chart-1)" },
  deficit: { label: "Deficit", color: "var(--chart-2)" },
} satisfies ChartConfig;

// ─── Helpers ───────────────────────────────────────────────────────────────

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}`;
}

function avgFromHistory(
  history: CashFlowPoint[],
  key: "income" | "expenses",
): number {
  if (!history.length) return 0;
  return history.reduce((s, p) => s + p[key], 0) / history.length;
}

function momChange(
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

function burnRate(expenses: number, income: number): number {
  if (income <= 0) return 100;
  return Math.min((expenses / income) * 100, 100);
}

function getCurrencySymbol(currency: string): string {
  return (
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}

// ─── Insight Engine ────────────────────────────────────────────────────────

function deriveInsights(
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
      body: `You're saving ${savingsRate.toFixed(1)}% of your income — well above the 20% benchmark. Your surplus of ${formatCurrency(surplus)}/mo compounds meaningfully over time.`,
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
      title: "High burn rate — low runway",
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

function InsightCard({ insight }: { insight: Insight }) {
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

// ─── Trend Pill ────────────────────────────────────────────────────────────

function TrendPill({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs text-muted-foreground">—</span>;
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

// ─── Surplus/Deficit Bar Chart ─────────────────────────────────────────────

function SurplusHistoryChart({ history }: { history: CashFlowPoint[] }) {
  const data = [...history]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((p) => ({
      label: new Date(p.month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      value: p.surplus ?? p.income - p.expenses,
    }));

  return (
    <ChartContainer config={surplusChartConfig} className="h-[120px] w-full">
      <BarChart data={data} barSize={28}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-muted"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          className="text-xs"
        />
        <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.2} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(v) => formatCurrency(v as number)}
              indicator="dot"
            />
          }
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.value >= 0 ? "var(--chart-1)" : "var(--chart-2)"}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

// ─── Enhanced Row Dialog ───────────────────────────────────────────────────

interface EnhancedRowDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  submitLabel: string;
  type: EditMode;
  draft: CashFlowEntryDraft;
  setDraft: React.Dispatch<React.SetStateAction<CashFlowEntryDraft>>;
  onSubmit: () => void;
}

function EnhancedRowDialog({
  open,
  onOpenChange,
  title,
  submitLabel,
  type,
  draft,
  setDraft,
  onSubmit,
}: EnhancedRowDialogProps) {
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const userCurrency = useFinancialStore((s) => s.user?.currency ?? "USD");
  const currencySymbol = getCurrencySymbol(userCurrency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "income" ? (
              <Banknote className="h-4 w-4 text-emerald-500" />
            ) : (
              <CreditCard className="h-4 w-4 text-red-400" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="row-name">Description</Label>
            <Input
              id="row-name"
              placeholder={
                type === "income" ? "e.g. Monthly salary" : "e.g. Rent payment"
              }
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="row-amount">Monthly amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="row-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="pl-7"
                  value={draft.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      amount: e.target.value.replace(/[^\d]/g, ""),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={draft.category}
                onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="row-date" className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
              Start date
              <span className="text-xs text-muted-foreground font-normal">
                (you can backdate this)
              </span>
            </Label>
            <DateInput
              id="row-date"
              value={draft.startDate}
              onChange={(v) => setDraft((d) => ({ ...d, startDate: v }))}
              placeholder="Pick a start date"
              toDate={new Date()}
              fromYear={2000}
              toYear={new Date().getFullYear()}
            />
            {draft.startDate &&
              draft.startDate < new Date().toISOString().split("T")[0] && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  This entry will be backdated — historical months will be
                  updated.
                </p>
              )}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Repeat2 className="h-3.5 w-3.5 text-muted-foreground" />
              Frequency
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(["forever", "months", "one-time"] as RecurringType[]).map(
                (opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, recurringType: opt }))
                    }
                    className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                      draft.recurringType === opt
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted bg-background text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {opt === "forever"
                      ? "Ongoing"
                      : opt === "months"
                        ? "Fixed period"
                        : "One-time"}
                  </button>
                ),
              )}
            </div>

            {draft.recurringType === "months" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <Input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="6"
                  className="w-24"
                  value={draft.recurringMonths}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      recurringMonths: e.target.value,
                    }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  months from start date
                </span>
              </motion.div>
            )}

            <div
              className={`rounded-md px-3 py-2 text-xs ${
                draft.recurringType === "forever"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                  : draft.recurringType === "months"
                    ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {draft.recurringType === "forever" &&
                "✓ This will auto-populate every month going forward."}
              {draft.recurringType === "months" &&
                draft.recurringMonths &&
                `✓ Will repeat for ${draft.recurringMonths} months from start date.`}
              {draft.recurringType === "months" &&
                !draft.recurringMonths &&
                "Enter the number of months above."}
              {draft.recurringType === "one-time" &&
                "This will only appear in the selected month."}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="row-note" className="text-muted-foreground text-xs">
              Note (optional)
            </Label>
            <Input
              id="row-note"
              placeholder="Any context or reminder…"
              value={draft.note}
              onChange={(e) =>
                setDraft((d) => ({ ...d, note: e.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!draft.name.trim() || !draft.amount}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Burn Rate Gauge ───────────────────────────────────────────────────────

function BurnRateCard({
  burn,
  income,
  expenses,
}: {
  burn: number;
  income: number;
  expenses: number;
}) {
  const level = burn > 90 ? "danger" : burn > 75 ? "warning" : "good";
  const colors = {
    good: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };
  const labels = {
    good: "Healthy burn rate",
    warning: "Moderate pressure",
    danger: "High burn rate",
  };
  const progressColors = {
    good: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };
  const bgColors = {
    good: "bg-emerald-50",
    warning: "bg-amber-50",
    danger: "bg-red-50",
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${bgColors[level]}`}>
              {level === "good" ? (
                <Droplets className={`h-4 w-4 ${colors[level]}`} />
              ) : (
                <Flame className={`h-4 w-4 ${colors[level]}`} />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {labels[level]}
              </p>
              <p className="text-xs text-muted-foreground">
                Expense-to-income ratio
              </p>
            </div>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${colors[level]}`}>
            {burn.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(burn, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${progressColors[level]}`}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>{formatCurrency(expenses)} expenses</span>
          <span>{formatCurrency(income)} income</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Category Breakdown ────────────────────────────────────────────────────

function CategoryBreakdown({
  rows,
  total,
  type,
}: {
  rows: MoneyRow[];
  total: number;
  type: "income" | "expense";
}) {
  const [expanded, setExpanded] = React.useState(false);
  const visible = expanded ? rows : rows.slice(0, 4);

  return (
    <div className="space-y-2.5">
      {visible.map((r) => {
        const pct = total > 0 ? (r.amount / total) * 100 : 0;
        return (
          <div key={r.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate max-w-[160px]">
                {r.name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(r.amount)}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${type === "income" ? "bg-emerald-500" : "bg-red-400"}`}
              />
            </div>
          </div>
        );
      })}
      {rows.length > 4 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> +{rows.length - 4} more
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CashFlowPage() {
  const router = useRouter();
  const { loading } = usePageData("cash-flow");

  // Fetch cashflow summary from API on mount (logged to console)
  React.useEffect(() => {
    fetchCashFlowSummary()
      .then((summary) =>
        console.log("[CashFlowPage] cashflow.summary response:", summary),
      )
      .catch((err) =>
        console.warn("[CashFlowPage] cashflow.summary failed:", err),
      );
  }, []);

  // ── Store subscriptions ───────────────────────────────────────────────────
  const storeHoldings = useFinancialStore((s) => s.holdings);
  const storePropertyAssets = useFinancialStore((s) => s.propertyAssets);
  const storeAccounts = useFinancialStore((s) => s.accounts);
  const storeEmergencyFund = useFinancialStore((s) => s.emergencyFund);
  const storeCashFlowHistory = useFinancialStore((s) => s.cashFlowHistory);

  const income = useFinancialStore((s) => s.incomeRows);
  const expenses = useFinancialStore((s) => s.expenseCategories);
  const pageCurrency = useFinancialStore((s) => s.user?.currency ?? "USD");
  const settings = React.useMemo<CashFlowSettings>(
    () => ({
      emergencyFundMonths: storeEmergencyFund.targetMonths,
      currentCashBalance: storeEmergencyFund.currentCashBalance,
    }),
    [storeEmergencyFund],
  );

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [rowDialogOpen, setRowDialogOpen] = React.useState(false);
  const [rowDialogType, setRowDialogType] = React.useState<EditMode>("income");
  const [rowDialogMode, setRowDialogMode] = React.useState<RowMode>("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const defaultDraft: CashFlowEntryDraft = {
    name: "",
    amount: "",
    isRecurring: true,
    recurringType: "forever",
    recurringMonths: "",
    startDate: new Date().toISOString().split("T")[0],
    category: "",
    note: "",
  };

  const [rowDraft, setRowDraft] =
    React.useState<CashFlowEntryDraft>(defaultDraft);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(
    null,
  );

  // ── Computed ──────────────────────────────────────────────────────────────

  const totalIncome = React.useMemo(
    () => sum(income.map((i) => i.amount)),
    [income],
  );
  const totalExpenses = React.useMemo(
    () => sum(expenses.map((e) => e.amount)),
    [expenses],
  );
  const surplus = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;
  const burn = burnRate(totalExpenses, totalIncome);

  const netWorth = React.useMemo(
    () =>
      calculateNetWorth(
        storeHoldings,
        [],
        storePropertyAssets.filter((p) => p.is_active),
        income,
        expenses,
        [],
      ),
    [storeHoldings, storePropertyAssets, income, expenses],
  );

  const avgIncome = avgFromHistory(storeCashFlowHistory, "income");
  const avgExpenses = avgFromHistory(storeCashFlowHistory, "expenses");
  const incMom = momChange(storeCashFlowHistory, "income");
  const expMom = momChange(storeCashFlowHistory, "expenses");

  const insights = React.useMemo(
    () =>
      deriveInsights(
        totalIncome,
        totalExpenses,
        savingsRate,
        storeCashFlowHistory,
      ),
    [totalIncome, totalExpenses, savingsRate, storeCashFlowHistory],
  );

  const financialData: FinancialDomainData = React.useMemo(
    () => ({
      accounts: storeAccounts,
      liabilities: [],
      propertyAssets: storePropertyAssets.map((p) => ({
        id: p.property_id,
        name: p.name,
        value: p.market_value,
        updatedAt: p.updated_at,
      })),
      portfolioPerformance: [],
      allocation: [],
      taxProfile: {
        effectiveTaxRatePct: 0,
        marginalTaxRatePct: 0,
        filingStatus: "single" as const,
        updatedAt: new Date().toISOString(),
      },
      emergencyFund: storeEmergencyFund,
      insurancePolicies: [],
      incomeRows: income,
      expenseCategories: expenses,
      freshness: [],
      retirement: {
        currentAge: 0,
        retirementAge: 0,
        lifeExpectancy: 85,
        currentInvested: 0,
        monthlySavings: 0,
        existingPensionBalance: 0,
        monthlyPensionContribution: 0,
        expectedReturnPct: 7,
        inflationPct: 2,
        safeWithdrawalRatePct: 4,
        desiredMonthlyIncome: 0,
      },
      cashFlowHistory: storeCashFlowHistory,
    }),
    [
      storeAccounts,
      storePropertyAssets,
      storeEmergencyFund,
      income,
      expenses,
      storeCashFlowHistory,
    ],
  );

  const efMetrics = React.useMemo(
    () => selectEmergencyFundMetrics(financialData),
    [financialData],
  );

  const hasAssets =
    storeHoldings.length > 0 ||
    storeAccounts.length > 0 ||
    storePropertyAssets.length > 0;

  const cashFlowKpis: KpiItem[] = [
    {
      label: "Net Worth",
      value: hasAssets ? formatCurrency(netWorth.netWorth) : "—",
      subline: hasAssets
        ? "Assets minus liabilities"
        : "Add assets to see net worth",
      tone: hasAssets
        ? netWorth.netWorth >= 0
          ? "good"
          : "danger"
        : "neutral",
      onClick: hasAssets
        ? undefined
        : () => router.push("/dashboard/profile/setup"),
    },
    {
      label: "Monthly Income",
      value: formatCurrency(totalIncome),
      subline:
        incMom !== null
          ? `${incMom > 0 ? "+" : ""}${incMom.toFixed(1)}% vs last month`
          : "No prior data",
      tone: incMom !== null ? (incMom >= 0 ? "good" : "warning") : "neutral",
    },
    {
      label: "Monthly Expenses",
      value: formatCurrency(totalExpenses),
      subline:
        expMom !== null
          ? `${expMom > 0 ? "+" : ""}${expMom.toFixed(1)}% vs last month`
          : "No prior data",
      tone: expMom !== null ? (expMom <= 0 ? "good" : "warning") : "neutral",
    },
    {
      label: "Surplus",
      value: formatCurrency(surplus),
      subline: surplus >= 0 ? "Cash positive" : "Monthly deficit",
      tone: surplus >= 0 ? "good" : "danger",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      subline: "Target ≥ 20%",
      tone: savingsRate >= 20 ? "good" : savingsRate > 0 ? "warning" : "danger",
    },
    storeEmergencyFund.currentCashBalance === 0
      ? {
          label: "Emergency Fund",
          value: "Not set up",
          subline: "Add a cash balance to track runway",
          tone: "neutral" as const,
        }
      : {
          label: "Emergency Fund",
          value:
            efMetrics.runwayMonths > 9
              ? "9+ mo runway"
              : `${Math.round(efMetrics.runwayMonths * 10) / 10}mo runway`,
          subline:
            totalExpenses === 0
              ? `${formatCurrency(efMetrics.currentBalance)} saved · add expenses to see runway`
              : efMetrics.funded
                ? `${formatCurrency(efMetrics.currentBalance)} · target ${efMetrics.targetMonths}mo`
                : `${formatCurrency(Math.abs(efMetrics.shortfallOrSurplus))} below ${efMetrics.targetMonths}mo target`,
          tone: efMetrics.funded
            ? "good"
            : efMetrics.runwayMonths >= 3
              ? "warning"
              : "danger",
        },
  ];

  // ── Dialog helpers ────────────────────────────────────────────────────────

  function openCreate(type: EditMode) {
    setRowDialogType(type);
    setRowDialogMode("create");
    setEditingId(null);
    setRowDraft({
      ...defaultDraft,
      startDate: new Date().toISOString().split("T")[0],
    });
    setRowDialogOpen(true);
  }

  function openEdit(type: EditMode, row: CashFlowRow | ExpenseCategory) {
    setRowDialogType(type);
    setRowDialogMode("edit");
    setEditingId(row.id);
    // Legacy rows with isRecurring=false had no recurringType — map them to "one-time"
    const resolvedRecurringType: RecurringType =
      row.recurringType ?? (row.isRecurring === false ? "one-time" : "forever");
    setRowDraft({
      ...defaultDraft,
      name: row.name,
      amount: String(row.amount),
      isRecurring: resolvedRecurringType !== "one-time",
      recurringType: resolvedRecurringType,
      recurringMonths: row.recurringMonths ? String(row.recurringMonths) : "",
      startDate: row.startDate ?? new Date().toISOString().split("T")[0],
    });
    setRowDialogOpen(true);
  }

  function requestDelete(type: EditMode, row: MoneyRow) {
    setDeleteTarget({ type, row });
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "income") {
      const updated = income.filter((x) => x.id !== deleteTarget.row.id);
      useFinancialStore.getState().setIncome(updated);
      deleteIncome(deleteTarget.row.id)
        .then(() => toast.success("Income source deleted."))
        .catch(() => toast.error("Failed to delete income source."));
    } else {
      const updated = expenses.filter((x) => x.id !== deleteTarget.row.id);
      useFinancialStore.getState().setExpenses(updated);
      deleteExpense(deleteTarget.row.id)
        .then(() => toast.success("Expense deleted."))
        .catch(() => toast.error("Failed to delete expense."));
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function submitRow() {
    const amountNum = Number(rowDraft.amount);
    if (!rowDraft.name.trim() || !Number.isFinite(amountNum) || amountNum < 0)
      return;

    const rowId = rowDialogMode === "edit" && editingId ? editingId : uid();

    if (rowDialogType === "income") {
      const newRow: CashFlowRow = {
        id: rowId,
        name: rowDraft.name.trim(),
        amount: Math.round(amountNum),
        isRecurring: rowDraft.recurringType !== "one-time",
        recurringType: rowDraft.recurringType,
        recurringMonths:
          rowDraft.recurringType === "months" && rowDraft.recurringMonths
            ? Number(rowDraft.recurringMonths)
            : undefined,
        startDate: rowDraft.startDate || undefined,
      };
      if (rowDialogMode === "edit") {
        updateIncome({
          id: newRow.id,
          name: newRow.name,
          amount: newRow.amount,
        })
          .then(() => toast.success("Income source updated."))
          .catch(() => toast.error("Failed to update income source."));
      } else {
        createIncome({
          name: newRow.name,
          amount: newRow.amount,
          category: rowDraft.category || "Other",
          source_currency: pageCurrency,
          recurring_type:
            newRow.recurringType === "one-time" ? "one-time" : "monthly",
          start_date:
            newRow.startDate ?? new Date().toISOString().split("T")[0],
        })
          .then((created) => {
            if (created?.id) newRow.id = created.id;
            toast.success("Income source added.");
          })
          .catch(() => toast.error("Failed to add income source."));
      }
      const updated =
        rowDialogMode === "edit"
          ? income.map((r) => (r.id === newRow.id ? newRow : r))
          : [newRow, ...income];
      useFinancialStore.getState().setIncome(updated);
    } else {
      const newRow: ExpenseCategory = {
        id: rowId,
        name: rowDraft.name.trim(),
        amount: Math.round(amountNum),
        essential: false,
        isRecurring: rowDraft.recurringType !== "one-time",
        recurringType: rowDraft.recurringType,
        recurringMonths:
          rowDraft.recurringType === "months" && rowDraft.recurringMonths
            ? Number(rowDraft.recurringMonths)
            : undefined,
        startDate: rowDraft.startDate || undefined,
      };
      if (rowDialogMode === "edit") {
        updateExpense({
          id: newRow.id,
          name: newRow.name,
          amount: newRow.amount,
        })
          .then(() => toast.success("Expense updated."))
          .catch(() => toast.error("Failed to update expense."));
      } else {
        createExpense({
          name: newRow.name,
          amount: newRow.amount,
          category: rowDraft.category || "Other",
          source_currency: pageCurrency,
          recurring_type:
            newRow.recurringType === "one-time" ? "one-time" : "monthly",
          start_date:
            newRow.startDate ?? new Date().toISOString().split("T")[0],
        })
          .then((created) => {
            if (created?.id) newRow.id = created.id;
            toast.success("Expense added.");
          })
          .catch(() => toast.error("Failed to add expense."));
      }
      const updated =
        rowDialogMode === "edit"
          ? expenses.map((r) => (r.id === newRow.id ? newRow : r))
          : [newRow, ...expenses];
      useFinancialStore.getState().setExpenses(updated);
    }

    setRowDialogOpen(false);
    setRowDraft(defaultDraft);
    setEditingId(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <div className="mx-auto w-full px-4 py-8 md:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Cash Flow</h1>
            <p className="text-sm text-muted-foreground">
              Your financial pulse; income, spending, and savings patterns.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit overview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add entry
                  <ChevronDown className="h-3.5 w-3.5 ml-0.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  What are you adding?
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => openCreate("income")}
                >
                  <Banknote className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Income source</p>
                    <p className="text-xs text-muted-foreground">
                      Salary, dividends, rent…
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => openCreate("expense")}
                >
                  <CreditCard className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-sm font-medium">Expense</p>
                    <p className="text-xs text-muted-foreground">
                      Housing, food, utilities…
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* KPI Strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KpiStrip items={cashFlowKpis} cols={6} loading={loading} />
        </motion.div>

        {/* Cash Flow Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <CashFlowChart data={storeCashFlowHistory} />
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Analytics
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <BurnRateCard
              burn={burn}
              income={totalIncome}
              expenses={totalExpenses}
            />

            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold">
                    Monthly surplus / deficit
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Last 6 months
                </p>
                <SurplusHistoryChart history={storeCashFlowHistory} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-semibold">Historical averages</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg income</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(avgIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg expenses</span>
                    <span className="font-medium text-red-400">
                      {formatCurrency(avgExpenses)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg surplus</span>
                    <span
                      className={`font-semibold ${avgIncome - avgExpenses >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {formatCurrency(avgIncome - avgExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      vs current surplus
                    </span>
                    <TrendPill
                      value={
                        avgIncome - avgExpenses > 0
                          ? ((surplus - (avgIncome - avgExpenses)) /
                              Math.abs(avgIncome - avgExpenses)) *
                            100
                          : null
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <PiggyBank className="h-4 w-4 text-violet-500" />
                  <p className="text-xs font-semibold">Savings velocity</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Monthly", value: formatCurrency(surplus) },
                    { label: "Quarterly", value: formatCurrency(surplus * 3) },
                    {
                      label: "Annual projection",
                      value: formatCurrency(surplus * 12),
                    },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span
                        className={`font-medium tabular-nums ${surplus >= 0 ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {r.value}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    At this rate, you'd save{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(surplus * 12)}
                    </span>{" "}
                    over the next 12 months.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Insights
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {insights.map((ins) => (
                <InsightCard key={ins.id} insight={ins} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Breakdown
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <NetWorthCard breakdown={netWorth} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-500" /> Income
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="tabular-nums text-emerald-600"
                    >
                      {formatCurrency(totalIncome)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {loading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-12 w-full rounded-lg"
                          />
                        ))
                      : income.map((r) => (
                          <RowItem
                            key={r.id}
                            row={r}
                            total={totalIncome}
                            onEdit={() => openEdit("income", r)}
                            onDelete={() => requestDelete("income", r)}
                          />
                        ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => openCreate("income")}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add income source
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-red-400" /> Expenses
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="tabular-nums text-red-500"
                    >
                      {formatCurrency(totalExpenses)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {loading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-12 w-full rounded-lg"
                          />
                        ))
                      : expenses.map((r) => (
                          <RowItem
                            key={r.id}
                            row={r}
                            total={totalExpenses}
                            onEdit={() => openEdit("expense", r)}
                            onDelete={() => requestDelete("expense", r)}
                          />
                        ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => openCreate("expense")}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add expense
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        <CelereyInsights />
      </div>

      {/* Dialogs */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        setSettings={(s) => {
          const updated = {
            ...storeEmergencyFund,
            targetMonths: s.emergencyFundMonths,
            currentCashBalance: s.currentCashBalance,
            updatedAt: new Date().toISOString(),
          };
          useFinancialStore.getState().setEmergencyFund(updated);
          updateEmergencyFund({
            cash_balance: s.currentCashBalance,
            target_months: s.emergencyFundMonths,
          })
            .then(() => toast.success("Emergency fund settings saved."))
            .catch(() =>
              toast.error("Failed to save emergency fund settings."),
            );
        }}
      />

      <EnhancedRowDialog
        open={rowDialogOpen}
        onOpenChange={setRowDialogOpen}
        title={
          rowDialogMode === "create"
            ? rowDialogType === "income"
              ? "Add income source"
              : "Add expense"
            : rowDialogType === "income"
              ? "Edit income source"
              : "Edit expense"
        }
        submitLabel={rowDialogMode === "create" ? "Add" : "Save changes"}
        type={rowDialogType}
        draft={rowDraft}
        setDraft={setRowDraft}
        onSubmit={submitRow}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={deleteTarget}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}
