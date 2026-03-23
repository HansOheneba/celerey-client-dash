"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faArrowTrendUp,
  faArrowTrendDown,
  faCalendarDays,
  faWallet,
  faShield,
  faCommentDots,
  faPiggyBank,
  faCircleExclamation,
  faCircleCheck,
  faClock,
  faFire,
  faBullseye,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import { useClientGate } from "../../lib/useClientGate";
import {
  canAccessFeature,
  type FeatureKey,
  advisorData,
  currentValue,
  createNetWorthSnapshot,
  recordNetWorthSnapshot,
  getLatestNetWorthChange,
  formatCurrency,
  selectRetirementOutputs,
  selectEmergencyFundMetrics,
  type FinancialDomainData,
  type CashFlowPoint,
} from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import QuizCard from "@/components/dashboard/risk/quizCard";
import { LockedFeatureCard } from "@/components/dashboard/overview/locked-feature-card";
import { KpiStrip } from "@/components/dashboard/kpi-strip";

// ─── Brand colors ─────────────────────────────────────────────────────────────

const PRIMARY = "#151339";
const INCOME_COLOR = "#1e3a5f";
const EXPENSES_COLOR = "#7eb8e8";

// ─── Types ────────────────────────────────────────────────────────────────────

type Snapshot = {
  netWorth: number;
  portfolioValue: number;
  monthlyCashFlow: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  goalsActive: number;
  goalsTotal: number;
  goalsCompleted: number;
  insurancePolicies: number;
  insuranceReviewDue: number;
  retirementOnTrack: boolean;
  yearsToRetirement: number;
  projectedRetirementBalance: number;
};

type UpcomingItem = { id: string; title: string; time: string; meta?: string };

type ActivityRow = {
  id: string;
  title: string;
  category: "Goal" | "Portfolio" | "Cash Flow" | "Insurance";
  date: string;
  status: "Pending" | "Completed";
};

// ─── Chart config ─────────────────────────────────────────────────────────────

const cashFlowChartConfig = {
  income: { label: "Income", color: INCOME_COLOR },
  expenses: { label: "Expenses", color: EXPENSES_COLOR },
} satisfies ChartConfig;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function InfoTip({ content }: { content: string }) {
  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help inline-flex">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors"
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] text-xs">
        {content}
      </TooltipContent>
    </UITooltip>
  );
}

function StatPill({
  label,
  value,
  positive,
  tip,
}: {
  label: string;
  value: string;
  positive?: boolean;
  tip?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {label} {tip && <InfoTip content={tip} />}
      </span>
      <span
        className={`text-sm font-semibold ${
          positive === true
            ? "text-emerald-600"
            : positive === false
              ? "text-red-500"
              : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InsuranceStatusBadge({ reviewDue }: { reviewDue: number }) {
  if (reviewDue === 0)
    return (
      <Badge
        variant="outline"
        className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1"
      >
        <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> All up to
        date
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-amber-600 border-amber-200 bg-amber-50 gap-1"
    >
      <FontAwesomeIcon icon={faCircleExclamation} className="h-3 w-3" />{" "}
      {reviewDue} review{reviewDue > 1 ? "s" : ""} due
    </Badge>
  );
}

function CashFlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const income = payload.find((p: any) => p.dataKey === "income");
  const expenses = payload.find((p: any) => p.dataKey === "expenses");
  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 text-xs space-y-1.5 min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {income && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: INCOME_COLOR }}
            />
            <span className="text-muted-foreground">Income</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(income.value)}
          </span>
        </div>
      )}
      {expenses && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: EXPENSES_COLOR }}
            />
            <span className="text-muted-foreground">Expenses</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(expenses.value)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { ready, auth, sub } = useClientGate();

  useEffect(() => {
    if (!ready) return;
    if (!auth.loggedIn) {
      router.replace("/");
      return;
    }
    if (auth.loggedIn && sub.status === "none") {
      router.replace("/choose-plan");
      return;
    }
  }, [ready, auth, sub.status, router]);

  function handleUpgradeIntent(): void {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("upgrade_intent", "true");
      } catch {
        /* noop */
      }
    }
    router.push("/choose-plan");
  }

  const access = useMemo(() => {
    const has = (k: FeatureKey) => canAccessFeature(sub.status, k);
    return {
      premiumInsights: has("premiumInsights"),
      exportData: has("exportData"),
      advisorChat: has("advisorChat"),
    };
  }, [sub.status]);

  // ── Store ─────────────────────────────────────────────────────────────────

  const store = useFinancialStore();
  const financialData: FinancialDomainData = useMemo(
    () => ({
      accounts: store.accounts,
      liabilities: store.liabilities,
      propertyAssets: store.propertyAssets.map((p) => ({
        id: p.property_id,
        name: p.name,
        value: p.market_value,
        updatedAt: p.updated_at,
      })),
      portfolioPerformance: store.portfolioPerformance,
      allocation: store.allocation,
      taxProfile: store.taxProfile,
      emergencyFund: store.emergencyFund,
      insurancePolicies: store.insurancePolicies,
      incomeRows: store.incomeRows,
      expenseCategories: store.expenseCategories,
      freshness: store.freshness,
      retirement: store.retirement,
      cashFlowHistory: store.cashFlowHistory,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store],
  );

  // ── Emergency fund ────────────────────────────────────────────────────────

  const efMetrics = useMemo(
    () => selectEmergencyFundMetrics(financialData),
    [financialData],
  );

  // ── Snapshot ──────────────────────────────────────────────────────────────

  const snapshot: Snapshot = useMemo(() => {
    const income = store.incomeRows.reduce((s, i) => s + i.amount, 0);
    const expenses = store.expenseCategories.reduce((s, e) => s + e.amount, 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const nw = createNetWorthSnapshot();
    const portfolioValue = store.holdings
      .filter((h) => h.is_active)
      .reduce((s, h) => s + currentValue(h, []), 0);
    const storeInsurance = store.insurancePolicies;
    const generalActivePolicies = storeInsurance.filter(
      (p) => p.is_active,
    ).length;
    const propertyInsCount = store.propertyAssets
      .filter((p) => p.is_active)
      .reduce((sum, p) => sum + (p.insurance?.length ?? 0), 0);
    const insuranceReviewDue = storeInsurance.filter((p) => {
      if (!p.is_active) return false;
      const days = Math.ceil(
        (new Date(p.renewal_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      return days >= 0 && days <= 60;
    }).length;
    const retirementOutputs = selectRetirementOutputs(store.retirement);

    return {
      netWorth: nw.netWorth ?? 0,
      portfolioValue,
      monthlyCashFlow: Math.round(income - expenses),
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate,
      goalsActive: store.goals.filter((g) => !g.completed).length,
      goalsTotal: store.goals.length,
      goalsCompleted: store.goals.filter((g) => g.completed).length,
      insurancePolicies: generalActivePolicies + propertyInsCount,
      insuranceReviewDue,
      retirementOnTrack: retirementOutputs.onTrack,
      yearsToRetirement: retirementOutputs.yearsToRetirement,
      projectedRetirementBalance:
        retirementOutputs.projectedBalanceAtRetirement,
    };
  }, [store]);

  // ── Net worth change ──────────────────────────────────────────────────────

  const [netWorthPercent, setNetWorthPercent] = React.useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!ready || !auth.loggedIn) return;
    try {
      recordNetWorthSnapshot({ dedupeDays: 1 });
      const change = getLatestNetWorthChange();
      if (change?.percent !== null && change?.since)
        setNetWorthPercent(change.percent);
    } catch {
      /* noop */
    }
  }, [ready, auth.loggedIn]);

  // ── Cash flow chart data ──────────────────────────────────────────────────

  const cashFlowChartData = useMemo(() => {
    return [...store.cashFlowHistory]
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((p: CashFlowPoint) => ({
        ...p,
        label: new Date(p.month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
      }));
  }, [store.cashFlowHistory]);

  const yMax = useMemo(() => {
    const max = Math.max(
      ...cashFlowChartData.flatMap((d) => [d.income, d.expenses]),
    );
    return Math.ceil(max / 10000) * 10000;
  }, [cashFlowChartData]);

  // ── Goals ─────────────────────────────────────────────────────────────────

  const topGoals = useMemo(
    () => store.goals.filter((g) => !g.completed).slice(0, 3),
    [store.goals],
  );

  // ── Upcoming & activity ───────────────────────────────────────────────────

  const upcoming: UpcomingItem[] = useMemo(() => {
    const items: UpcomingItem[] = [];
    if (advisorData.upcomingMeeting) {
      items.push({
        id: "advisor-1",
        title: advisorData.upcomingMeeting.title,
        time: advisorData.upcomingMeeting.dateLabel,
        meta: "Advisor",
      });
    }
    if (advisorData.actionItems.length > 0) {
      const ai = advisorData.actionItems[0];
      items.push({
        id: `action-${ai.id}`,
        title: ai.label,
        time: ai.dueLabel,
        meta: "Action",
      });
    }
    if (items.length === 0)
      items.push({ id: "u-fallback", title: "No upcoming items", time: "—" });
    return items;
  }, []);

  const activity: ActivityRow[] = useMemo(() => {
    const rows: ActivityRow[] = [];
    store.goals.slice(0, 3).forEach((g) =>
      rows.push({
        id: `g-${g.id}`,
        title: g.completed ? `Completed: ${g.title}` : `${g.title} updated`,
        category: "Goal",
        date: g.completedDate ?? new Date().toLocaleDateString(),
        status: g.completed ? "Completed" : "Pending",
      }),
    );
    store.incomeRows.slice(0, 2).forEach((c) =>
      rows.push({
        id: `c-${c.id}`,
        title: `${c.name} recorded`,
        category: "Cash Flow",
        date: new Date().toLocaleDateString(),
        status: "Completed",
      }),
    );
    advisorData.actionItems.slice(0, 2).forEach((a) =>
      rows.push({
        id: `a-${a.id}`,
        title: a.label,
        category: "Insurance",
        date: a.dueLabel,
        status: a.done ? "Completed" : "Pending",
      }),
    );
    return rows;
  }, [store.goals, store.incomeRows]);

  // ── Greeting ──────────────────────────────────────────────────────────────

  const greetingName = useMemo(() => {
    const full = store.user?.display_name ?? "";
    if (full) return full.split(" ")[0] ?? "";
    const prefix = (auth.email ?? "").split("@")[0] ?? "";
    return prefix.replace(/[._-]+/g, " ").trim();
  }, [store.user?.display_name, auth.email]);

  const timeGreeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // ── Motion ────────────────────────────────────────────────────────────────

  const mc = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.06, delayChildren: 0.05 },
        },
      };
  const mi = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
      };

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "show"}
        variants={mc}
        className="w-full"
      >
        <div className="mx-auto px-6 py-8 space-y-8">
          {/* ── Header ── */}
          <motion.div
            variants={mi}
            className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Hi{greetingName ? ` ${greetingName}` : ""},
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {timeGreeting}
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <FontAwesomeIcon icon={faCalendarDays} className="h-4 w-4" />
              <span>
                As of{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </motion.div>

          {/* ── KPI Strip ── */}
          <motion.div variants={mi}>
            <SectionLabel>At a glance</SectionLabel>
            <KpiStrip
              cols={4}
              items={[
                {
                  label: "Net Worth",
                  value: formatCurrency(snapshot.netWorth),
                  subline: "Assets minus liabilities",
                  tone: snapshot.netWorth >= 0 ? "good" : "danger",
                  onClick: () => router.push("/dashboard/cash-flow"),
                },
                {
                  label: "Portfolio Value",
                  value: formatCurrency(snapshot.portfolioValue),
                  subline: `${store.holdings.filter((h) => h.is_active).length} active holdings`,
                  tone: "neutral",
                  onClick: () => router.push("/dashboard/assets"),
                },
                {
                  label: "Monthly Surplus",
                  value: formatCurrency(snapshot.monthlyCashFlow),
                  subline: `${formatCurrency(snapshot.monthlyIncome)} in · ${formatCurrency(snapshot.monthlyExpenses)} out`,
                  tone: snapshot.monthlyCashFlow >= 0 ? "good" : "danger",
                  onClick: () => router.push("/dashboard/cash-flow"),
                },
                {
                  label: "Emergency Fund",
                  value: `${Math.round(efMetrics.runwayMonths * 10) / 10}mo runway`,
                  subline: efMetrics.funded
                    ? `${formatCurrency(efMetrics.currentBalance)} · Fully funded`
                    : `${formatCurrency(Math.abs(efMetrics.shortfallOrSurplus))} short of ${efMetrics.targetMonths}mo target`,
                  tone: efMetrics.funded
                    ? "good"
                    : efMetrics.runwayMonths >= 3
                      ? "warning"
                      : "danger",
                  onClick: () => router.push("/dashboard/cash-flow"),
                },
              ]}
            />
          </motion.div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Cash Flow Chart */}
              <motion.div variants={mi}>
                <SectionLabel>Cash flow</SectionLabel>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Income vs Expenses
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Last 6 months
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => router.push("/dashboard/cash-flow")}
                      >
                        View details{" "}
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          className="h-3 w-3"
                        />
                      </Button>
                    </div>

                    {/* Summary stats */}
                    <div className="flex gap-6 pt-2 flex-wrap">
                      <StatPill
                        label="Monthly income"
                        value={formatCurrency(snapshot.monthlyIncome)}
                        positive={true}
                        tip="Total income across all sources this month."
                      />
                      <StatPill
                        label="Monthly expenses"
                        value={formatCurrency(snapshot.monthlyExpenses)}
                        positive={false}
                        tip="Total outgoings this month including essential and discretionary spend."
                      />
                      <StatPill
                        label="Surplus"
                        value={formatCurrency(snapshot.monthlyCashFlow)}
                        positive={snapshot.monthlyCashFlow > 0}
                        tip="What remains after all expenses. Positive means you are saving money this month."
                      />
                      <StatPill
                        label="Savings rate"
                        value={`${snapshot.savingsRate.toFixed(1)}%`}
                        positive={snapshot.savingsRate >= 20}
                        tip="Percentage of income saved. Financial advisors recommend at least 20%."
                      />
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="inline-block h-2 w-6 rounded-full"
                          style={{ backgroundColor: INCOME_COLOR }}
                        />
                        Income
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="inline-block h-2 w-6 rounded-full"
                          style={{ backgroundColor: EXPENSES_COLOR }}
                        />
                        Expenses
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-2 pt-2 sm:px-6">
                    <ChartContainer
                      config={cashFlowChartConfig}
                      className="aspect-auto h-[220px] w-full"
                    >
                      <LineChart
                        data={cashFlowChartData}
                        margin={{ left: 12, right: 12 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          className="text-xs text-muted-foreground"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          width={72}
                          domain={[0, yMax]}
                          tickFormatter={(v) => formatCurrency(v)}
                          className="text-xs text-muted-foreground"
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<CashFlowTooltip />}
                        />
                        <Line
                          dataKey="income"
                          type="monotone"
                          stroke={INCOME_COLOR}
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          dataKey="expenses"
                          type="monotone"
                          stroke={EXPENSES_COLOR}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Goals */}
              <motion.div variants={mi}>
                <SectionLabel>Financial goals</SectionLabel>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Goals in progress
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {snapshot.goalsCompleted} of {snapshot.goalsTotal}{" "}
                          completed
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => router.push("/dashboard/goals")}
                        >
                          All goals{" "}
                          <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            className="h-3 w-3"
                          />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topGoals.map((goal) => {
                      const pct = Math.min(
                        (goal.current / goal.target) * 100,
                        100,
                      );
                      return (
                        <div key={goal.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={faBullseye}
                                className="h-3.5 w-3.5"
                                style={{ color: PRIMARY }}
                              />
                              <span className="font-medium">{goal.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                {formatCurrency(goal.current)} /{" "}
                                {formatCurrency(goal.target)}
                              </span>
                              <span className="font-semibold text-foreground">
                                {pct.toFixed(0)}%
                              </span>
                              {goal.yearsRemaining > 0 && (
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon
                                    icon={faClock}
                                    className="h-3 w-3"
                                  />
                                  {goal.yearsRemaining}yr
                                </span>
                              )}
                            </div>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>{snapshot.goalsCompleted} goals completed</span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="h-3 w-3"
                        />{" "}
                        {snapshot.goalsActive} active
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div variants={mi}>
                <SectionLabel>Recent activity</SectionLabel>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Latest updates
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => router.push("/activity")}
                      >
                        View all{" "}
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          className="h-3 w-3"
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted-foreground border-b">
                            <th className="py-2.5 pr-4 font-medium text-xs">
                              Item
                            </th>
                            <th className="py-2.5 pr-4 font-medium text-xs">
                              Category
                            </th>
                            <th className="py-2.5 pr-4 font-medium text-xs">
                              Date
                            </th>
                            <th className="py-2.5 font-medium text-xs text-right">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activity.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => router.push("/activity")}
                            >
                              <td className="py-3 pr-4 font-medium">
                                {row.title}
                              </td>
                              <td className="py-3 pr-4">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  {row.category}
                                </Badge>
                              </td>
                              <td className="py-3 pr-4 text-muted-foreground text-xs">
                                {row.date}
                              </td>
                              <td className="py-3 text-right">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    row.status === "Completed"
                                      ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                                      : "text-amber-600 border-amber-200 bg-amber-50"
                                  }`}
                                >
                                  {row.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Retirement */}
              <motion.div variants={mi}>
                <SectionLabel>Retirement</SectionLabel>
                <Card
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => router.push("/dashboard/retirement")}
                >
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-semibold">
                            Retirement track
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {snapshot.yearsToRetirement} years away
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          snapshot.retirementOnTrack
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                            : "text-amber-600 border-amber-200 bg-amber-50"
                        }`}
                      >
                        {snapshot.retirementOnTrack ? (
                          <>
                            <FontAwesomeIcon
                              icon={faArrowTrendUp}
                              className="h-3 w-3 mr-1"
                            />{" "}
                            On track
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faArrowTrendDown}
                              className="h-3 w-3 mr-1"
                            />{" "}
                            Needs attention
                          </>
                        )}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-3">
                      <StatPill
                        label="Retire at"
                        value={`Age ${store.retirement.retirementAge}`}
                        tip="Your target retirement age."
                      />
                      <StatPill
                        label="Monthly savings"
                        value={formatCurrency(store.retirement.monthlySavings)}
                        tip="Combined monthly contributions to investments and pension."
                      />
                      <StatPill
                        label="Projected balance"
                        value={formatCurrency(
                          snapshot.projectedRetirementBalance,
                        )}
                        tip="Estimated portfolio value at your target retirement age based on current contributions and expected returns."
                      />
                      <StatPill
                        label="Target income"
                        value={
                          formatCurrency(
                            store.retirement.desiredMonthlyIncome,
                          ) + "/mo"
                        }
                        tip="Your desired monthly income in retirement in today's dollars."
                      />
                    </div>

                    <Progress
                      value={Math.min(
                        (store.retirement.currentInvested /
                          snapshot.projectedRetirementBalance) *
                          100,
                        100,
                      )}
                      className="h-1.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(store.retirement.currentInvested)}{" "}
                      invested today toward projected{" "}
                      {formatCurrency(snapshot.projectedRetirementBalance)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Insurance */}
              <motion.div variants={mi}>
                <SectionLabel>Insurance</SectionLabel>
                <Card
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => router.push("/dashboard/insurance")}
                >
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-semibold">Coverage</p>
                          <p className="text-xs text-muted-foreground">
                            {snapshot.insurancePolicies} active policies
                          </p>
                        </div>
                      </div>
                      <InsuranceStatusBadge
                        reviewDue={snapshot.insuranceReviewDue}
                      />
                    </div>

                    <Separator />

                    {store.insurancePolicies
                      .filter((p) => p.is_active)
                      .slice(0, 4)
                      .map((p) => (
                        <div
                          key={p.policy_id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground capitalize">
                            {p.category} · {p.name}
                          </span>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(p.premium_monthly)}/mo
                          </span>
                        </div>
                      ))}

                    {store.insurancePolicies.filter((p) => p.is_active).length >
                      4 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        +
                        {store.insurancePolicies.filter((p) => p.is_active)
                          .length - 4}{" "}
                        more policies
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upcoming */}
              <motion.div variants={mi}>
                <SectionLabel>Upcoming</SectionLabel>
                <Card>
                  <CardContent className="pt-5 space-y-3">
                    {upcoming.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-md border px-3 py-3 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => router.push("/schedule")}
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.time}
                            {item.meta ? ` · ${item.meta}` : ""}
                          </div>
                        </div>
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"
                        />
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      className="w-full justify-between text-xs"
                      onClick={() => router.push("/schedule/new")}
                    >
                      Add new schedule{" "}
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="h-3 w-3"
                      />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Advisor */}
              <motion.div variants={mi}>
                <LockedFeatureCard
                  title="Advisor"
                  description="Talk to an advisor for guidance and planning."
                  icon={
                    <FontAwesomeIcon icon={faCommentDots} className="h-5 w-5" />
                  }
                  hasAccess={access.advisorChat}
                  onOpen={() => router.push("/advisor")}
                  onUpgrade={handleUpgradeIntent}
                />
              </motion.div>

              {/* Risk quiz */}
              <motion.div variants={mi}>
                <QuizCard />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
