"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  BarChart3,
  PiggyBank,
  CreditCard,
  Banknote,
  ChevronDown,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

import { KpiStrip, type KpiItem } from "@/components/dashboard/kpi-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import {
  RowItem,
  type MoneyRow,
} from "@/components/dashboard/cash-flow/row-item";
import { SettingsDialog } from "@/components/dashboard/cash-flow/settings-dialog";
import { NetWorthCard } from "@/components/dashboard/cash-flow/net-worth-card";
import {
  DeleteConfirmDialog,
  type EditMode,
  type DeleteTarget,
} from "@/components/dashboard/cash-flow/delete-confirm-dialog";
import { CashFlowChart } from "@/components/dashboard/cash-flow/cash-flow-chart";
import { BurnRateCard } from "@/components/dashboard/cash-flow/burn-rate-card";
import {
  CategoryBreakdown,
  TrendPill,
} from "@/components/dashboard/cash-flow/category-breakdown";
import {
  InsightCard,
  deriveInsights,
  burnRate,
  momChange,
} from "@/components/dashboard/cash-flow/insight-card";
import { SurplusHistoryChart } from "@/components/dashboard/cash-flow/surplus-history-chart";
import {
  CreateEntryDialog,
  EditEntryDialog,
} from "@/components/dashboard/cash-flow/entry-dialog";

import {
  calculateNetWorth,
  selectEmergencyFundMetrics,
  formatCurrency,
  type CashFlowPoint,
  type CashFlowRow,
  type ExpenseCategory,
  type CashFlowEntryDraft,
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
} from "@/lib/dashboard-api";
import { usePageData } from "@/hooks/usePageData";
import { toast } from "sonner";

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

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CashFlowPage() {
  const { loading } = usePageData("cash-flow");

  // ── Store subscriptions ───────────────────────────────────────────────────
  const storeHoldings = useFinancialStore((s) => s.holdings);
  const storePropertyAssets = useFinancialStore((s) => s.propertyAssets);
  const storeAccounts = useFinancialStore((s) => s.accounts);
  const storeEmergencyFund = useFinancialStore((s) => s.emergencyFund);
  const storeCashFlowHistory = useFinancialStore((s) => s.cashFlowHistory);
  const cashFlowSummary = useFinancialStore((s) => s.cashFlowSummary);

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

  // ── Dialog state ──────────────────────────────────────────────────────────

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Create dialog
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createType, setCreateType] = React.useState<EditMode>("income");
  const defaultDraft: CashFlowEntryDraft = {
    name: "",
    amount: "",
    recurringType: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    category: "",
  };
  const [createDraft, setCreateDraft] =
    React.useState<CashFlowEntryDraft>(defaultDraft);

  // Edit dialog (amount-only)
  const [editOpen, setEditOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<{
    type: EditMode;
    id: string;
    name: string;
  } | null>(null);
  const [editAmount, setEditAmount] = React.useState("");

  // Delete dialog
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

  const insights = React.useMemo(() => {
    const apiIn = cashFlowSummary?.insights_inputs;
    return deriveInsights(
      apiIn?.totalIncome ?? totalIncome,
      apiIn?.totalExpenses ?? totalExpenses,
      apiIn?.savingsRate ?? savingsRate,
      storeCashFlowHistory,
    );
  }, [
    cashFlowSummary,
    totalIncome,
    totalExpenses,
    savingsRate,
    storeCashFlowHistory,
  ]);

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

  const cashFlowKpis: KpiItem[] = [
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
      subline: "Target >= 20%",
      tone: savingsRate >= 20 ? "good" : savingsRate > 0 ? "warning" : "danger",
    },
    !storeEmergencyFund.currentCashBalance
      ? {
          label: "Emergency Fund",
          value: "Not set up",
          subline: "Add a cash balance to track runway",
          tone: "neutral" as const,
        }
      : totalExpenses === 0
        ? {
            label: "Emergency Fund",
            value: formatCurrency(efMetrics.currentBalance),
            subline: "Add expenses to calculate runway",
            tone: "neutral" as const,
          }
        : {
            label: "Emergency Fund",
            value:
              efMetrics.runwayMonths > 9
                ? "9+ mo runway"
                : `${Math.round(efMetrics.runwayMonths * 10) / 10}mo runway`,
            subline: efMetrics.funded
              ? `${formatCurrency(efMetrics.currentBalance)} - target ${efMetrics.targetMonths}mo`
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
    setCreateType(type);
    setCreateDraft({
      ...defaultDraft,
      startDate: new Date().toISOString().split("T")[0],
    });
    setCreateOpen(true);
  }

  function openEdit(type: EditMode, row: CashFlowRow | ExpenseCategory) {
    setEditTarget({ type, id: row.id, name: row.name });
    setEditAmount(String(row.amount));
    setEditOpen(true);
  }

  function requestDelete(type: EditMode, row: MoneyRow) {
    setDeleteTarget({ type, row });
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "income") {
      useFinancialStore
        .getState()
        .setIncome(income.filter((x) => x.id !== deleteTarget.row.id));
      deleteIncome(deleteTarget.row.id)
        .then(() => toast.success("Income source deleted."))
        .catch(() => toast.error("Failed to delete income source."));
    } else {
      useFinancialStore
        .getState()
        .setExpenses(expenses.filter((x) => x.id !== deleteTarget.row.id));
      deleteExpense(deleteTarget.row.id)
        .then(() => toast.success("Expense deleted."))
        .catch(() => toast.error("Failed to delete expense."));
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function submitCreate() {
    const amountNum = Number(createDraft.amount);
    if (
      !createDraft.name.trim() ||
      !Number.isFinite(amountNum) ||
      amountNum < 0
    )
      return;

    const rowId = uid();
    const today = new Date().toISOString().split("T")[0];

    if (createType === "income") {
      const newRow: CashFlowRow = {
        id: rowId,
        name: createDraft.name.trim(),
        amount: Math.round(amountNum),
        isRecurring: createDraft.recurringType !== "one-time",
        recurringType: createDraft.recurringType,
        startDate: createDraft.startDate || today,
        endDate: createDraft.endDate || undefined,
      };
      createIncome({
        name: newRow.name,
        amount: newRow.amount,
        category: createDraft.category || "Other",
        source_currency: pageCurrency,
        recurring_type: createDraft.recurringType,
        start_date: newRow.startDate ?? today,
        end_date: createDraft.endDate || null,
      })
        .then((created) => {
          if (created?.id) newRow.id = created.id;
          toast.success("Income source added.");
        })
        .catch(() => toast.error("Failed to add income source."));
      useFinancialStore.getState().setIncome([newRow, ...income]);
    } else {
      const newRow: ExpenseCategory = {
        id: rowId,
        name: createDraft.name.trim(),
        amount: Math.round(amountNum),
        essential: false,
        isRecurring: createDraft.recurringType !== "one-time",
        recurringType: createDraft.recurringType,
        startDate: createDraft.startDate || today,
        endDate: createDraft.endDate || undefined,
      };
      createExpense({
        name: newRow.name,
        amount: newRow.amount,
        category: createDraft.category || "Other",
        source_currency: pageCurrency,
        recurring_type: createDraft.recurringType,
        start_date: newRow.startDate ?? today,
        end_date: createDraft.endDate || null,
      })
        .then((created) => {
          if (created?.id) newRow.id = created.id;
          toast.success("Expense added.");
        })
        .catch(() => toast.error("Failed to add expense."));
      useFinancialStore.getState().setExpenses([newRow, ...expenses]);
    }

    setCreateOpen(false);
    setCreateDraft(defaultDraft);
  }

  function submitEdit() {
    if (!editTarget) return;
    const amountNum = Number(editAmount);
    if (!Number.isFinite(amountNum) || amountNum < 0) return;
    const rounded = Math.round(amountNum);

    if (editTarget.type === "income") {
      useFinancialStore
        .getState()
        .setIncome(
          income.map((r) =>
            r.id === editTarget.id ? { ...r, amount: rounded } : r,
          ),
        );
      updateIncome({ id: editTarget.id, amount: rounded })
        .then(() => toast.success("Income source updated."))
        .catch(() => toast.error("Failed to update income source."));
    } else {
      useFinancialStore
        .getState()
        .setExpenses(
          expenses.map((r) =>
            r.id === editTarget.id ? { ...r, amount: rounded } : r,
          ),
        );
      updateExpense({ id: editTarget.id, amount: rounded })
        .then(() => toast.success("Expense updated."))
        .catch(() => toast.error("Failed to update expense."));
    }

    setEditOpen(false);
    setEditTarget(null);
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
              Your financial pulse - income, spending, and savings patterns.
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
                      Salary, dividends, rent...
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
                      Housing, food, utilities...
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
          <KpiStrip items={cashFlowKpis} cols={5} loading={loading} />
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
          <div className="grid grid-cols-1 gap-4 @sm/dash:grid-cols-2 @4xl/dash:grid-cols-4">
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

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Breakdown
          </p>
          <div className="grid grid-cols-1 gap-4 @3xl/dash:grid-cols-3">
            <div className="@3xl/dash:col-span-1">
              <NetWorthCard breakdown={netWorth} />
            </div>
            <div className="grid grid-cols-1 gap-4 @sm/dash:grid-cols-2 @3xl/dash:col-span-2">
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

      <CreateEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        type={createType}
        draft={createDraft}
        setDraft={setCreateDraft}
        onSubmit={submitCreate}
      />

      <EditEntryDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        type={editTarget?.type ?? "income"}
        name={editTarget?.name ?? ""}
        amount={editAmount}
        setAmount={setEditAmount}
        onSubmit={submitEdit}
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
