"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

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
import { setSubscriptionData } from "../../lib/client-data";
import { fetchSubscription } from "../../lib/dashboard-api";
import { useMonthlySnapshot } from "@/hooks/useMonthlySnapshot";
import { usePageData } from "@/hooks/usePageData";
import {
  canAccessFeature,
  type FeatureKey,
  currentValue,
  recordNetWorthSnapshot,
  getLatestNetWorthChange,
  formatCurrency,
  selectRetirementOutputs,
  selectEmergencyFundMetrics,
  calculateNetWorth,
  projectMonthlyAmount,
  type FinancialDomainData,
  type CashFlowPoint,
  type RecurringType,
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
import { Skeleton } from "@/components/ui/skeleton";
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
      <TooltipContent className="max-w-55 text-xs">{content}</TooltipContent>
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
  const incomeValue: number | undefined =
    payload.find((p: any) => p.dataKey === "income" && p.value != null)
      ?.value ??
    payload.find((p: any) => p.dataKey === "projIncome" && p.value != null)
      ?.value;
  const expensesValue: number | undefined =
    payload.find((p: any) => p.dataKey === "expenses" && p.value != null)
      ?.value ??
    payload.find((p: any) => p.dataKey === "projExpenses" && p.value != null)
      ?.value;
  const isProjected: boolean =
    payload.some((p: any) => p.dataKey === "projIncome" && p.value != null) &&
    !payload.some((p: any) => p.dataKey === "income" && p.value != null);
  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 text-xs space-y-1.5 min-w-40">
      <p className="font-semibold text-foreground mb-1">
        {label}
        {isProjected && (
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
            (projected)
          </span>
        )}
      </p>
      {incomeValue != null && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: INCOME_COLOR }}
            />
            <span className="text-muted-foreground">Income</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(incomeValue)}
          </span>
        </div>
      )}
      {expensesValue != null && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: EXPENSES_COLOR }}
            />
            <span className="text-muted-foreground">Expenses</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(expensesValue)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Empty state nudge ────────────────────────────────────────────────────────

function EmptyNudge({
  message,
  buttonLabel,
  onAction,
}: {
  message: string;
  buttonLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
      <p className="text-sm text-muted-foreground max-w-65">{message}</p>
      <Button size="sm" variant="outline" onClick={onAction}>
        {buttonLabel}
      </Button>
    </div>
  );
}

// ─── Cash flow chart helpers ─────────────────────────────────────────────────
function addMonthStr(base: Date, offset: number): string {
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function toMonthLabel(isoMonth: string): string {
  return new Date(isoMonth + "-01").toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function nextIsoMonthStr(m: string): string {
  const [y, mon] = m.split("-").map(Number);
  return addMonthStr(new Date(y, mon - 1, 1), 1);
}

/**
 * Like `projectMonthlyAmount` but ONLY counts rows that carry an explicit
 * `startDate` on or before `isoMonth`. Rows without a startDate that are
 * ongoing/forever are also included (matching forward-projection behaviour).
 * Used to build synthetic historical data so the chart never shows stale
 * cashFlowHistory snapshots.
 */
function projectHistoricalAmountOverview(
  rows: Array<{
    amount: number;
    isRecurring?: boolean;
    recurringType?: RecurringType;
    recurringMonths?: number;
    startDate?: string;
  }>,
  isoMonth: string,
): number {
  return rows
    .filter((row) => {
      const isOngoing =
        row.recurringType !== "one-time" && row.isRecurring !== false;
      if (!row.startDate) return isOngoing;
      const startMonth = row.startDate.slice(0, 7);
      if (isoMonth < startMonth) return false;
      if (!row.isRecurring || row.recurringType === "one-time") {
        return startMonth === isoMonth;
      }
      return true;
    })
    .reduce((s, r) => s + r.amount, 0);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { ready, auth, sub, userType } = useClientGate();
  useMonthlySnapshot();

  // ── Stripe return: poll subscription.find until the webhook activates ─────
  // The Stripe success redirect can land here BEFORE the
  // checkout.session.completed webhook has updated subscription_status on the
  // backend. Doing a single fetch + reload would race the webhook and persist
  // a stale "none", which DashboardGuard would then bounce to /choose-plan.
  // Instead we poll with a "Confirming your subscription…" overlay until the
  // status flips to trialing/active, or we hit a timeout.
  type StripeReturnState = "idle" | "confirming" | "timeout";
  const [stripeReturnState, setStripeReturnState] = useState<StripeReturnState>(
    () => {
      if (typeof window === "undefined") return "idle";
      return new URLSearchParams(window.location.search).get("sub") ===
        "success"
        ? "confirming"
        : "idle";
    },
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("sub") !== "success") return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const POLL_INTERVAL_MS = 1500;
    const MAX_DURATION_MS = 20000;
    const start = Date.now();

    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await fetchSubscription();
        if (cancelled) return;
        if (
          data &&
          (data.subscription_status === "trialing" ||
            data.subscription_status === "active")
        ) {
          // setSubscriptionData dispatches celerey:sub-updated, which makes
          // useClientGate re-read and the paywall redirect effect skip.
          setSubscriptionData(data);
          setStripeReturnState("idle");
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Non-fatal - retry until timeout
      }
      if (Date.now() - start >= MAX_DURATION_MS) {
        setStripeReturnState("timeout");
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    if (!auth.loggedIn) {
      router.replace("/");
      return;
    }
    // Subscription paywall redirect is temporarily disabled while the
    // backend subscription_status sync is being fixed. Premium features
    // remain gated by canAccessFeature() below.
  }, [ready, auth, router]);

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
    const effectiveSub = {
      ...sub,
      isEnterprise: sub.isEnterprise || userType === "enterprise",
    };
    const has = (k: FeatureKey) => canAccessFeature(effectiveSub, k);
    return {
      premiumInsights: has("premiumInsights"),
      exportData: has("exportData"),
      advisorChat: has("advisorChat"),
    };
  }, [sub, userType]);

  // ── Store ─────────────────────────────────────────────────────────────────

  const { loading } = usePageData("overview");

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
    const netWorth = calculateNetWorth(
      store.holdings,
      [],
      store.propertyAssets.filter((p) => p.is_active),
      store.incomeRows,
      store.expenseCategories,
    ).netWorth;
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
      netWorth,
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

  // ── Asset presence check ──────────────────────────────────────────────────

  const hasAssets =
    store.holdings.length > 0 ||
    store.accounts.length > 0 ||
    store.propertyAssets.length > 0;

  // ── Net worth change ──────────────────────────────────────────────────────

  const [netWorthPercent, setNetWorthPercent] = React.useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!ready || !auth.loggedIn) return;
    try {
      recordNetWorthSnapshot({ dedupeDays: 1, netWorth: snapshot.netWorth });
      const change = getLatestNetWorthChange();
      if (change?.percent !== null && change?.since)
        setNetWorthPercent(change.percent);
    } catch {
      /* noop */
    }
  }, [ready, auth.loggedIn, snapshot.netWorth]);

  // ── Cash flow chart data ──────────────────────────────────────────────────

  const cashFlowChartData = useMemo(() => {
    const today = new Date();
    const currentMonth = addMonthStr(today, 0);

    // How far back to generate synthetic data: earliest row startDate, capped at 6 months
    const minHistoricalMonth = addMonthStr(today, -6);
    const allStartMonths = [
      ...store.incomeRows
        .filter((r) => r.startDate && r.startDate.slice(0, 7) <= currentMonth)
        .map((r) => r.startDate!.slice(0, 7)),
      ...store.expenseCategories
        .filter((r) => r.startDate && r.startDate.slice(0, 7) <= currentMonth)
        .map((r) => r.startDate!.slice(0, 7)),
    ];
    const earliestHistoricalMonth =
      allStartMonths.length > 0
        ? [
            ...allStartMonths.filter((m) => m >= minHistoricalMonth),
            minHistoricalMonth,
          ].reduce((a, b) => (a < b ? a : b))
        : minHistoricalMonth;

    const actualByMonth = new Map(
      store.cashFlowHistory.map((d: CashFlowPoint) => [d.month, d]),
    );

    // ── Historical: synthetic wins; stale cashFlowHistory is fallback only ──
    type ChartPoint = {
      month: string;
      label: string;
      income: number | null;
      expenses: number | null;
      projIncome: number | null;
      projExpenses: number | null;
      isProjected: boolean;
    };

    const points: ChartPoint[] = [];
    let m = earliestHistoricalMonth;
    while (m <= currentMonth) {
      const actual = actualByMonth.get(m);
      const synthIncome = projectHistoricalAmountOverview(store.incomeRows, m);
      const synthExpenses = projectHistoricalAmountOverview(
        store.expenseCategories,
        m,
      );
      // Synthetic rows always win; only fall back to recorded actuals when
      // the rows themselves produce nothing (e.g. months before any row exists)
      const finalIncome = synthIncome > 0 ? synthIncome : (actual?.income ?? 0);
      const finalExpenses =
        synthExpenses > 0 ? synthExpenses : (actual?.expenses ?? 0);

      if (actual || finalIncome > 0 || finalExpenses > 0) {
        points.push({
          month: m,
          label: toMonthLabel(m),
          income: finalIncome,
          expenses: finalExpenses,
          projIncome: null,
          projExpenses: null,
          isProjected: false,
        });
      }
      m = nextIsoMonthStr(m);
    }

    // Bridge: last historical point also anchors the projected dashed line
    if (points.length > 0) {
      const last = points[points.length - 1];
      last.projIncome = last.income;
      last.projExpenses = last.expenses;
    }

    // ── Future: 6 months forward projection ──────────────────────────────
    for (let i = 1; i <= 6; i++) {
      const futureMonth = addMonthStr(today, i);
      if (!actualByMonth.has(futureMonth)) {
        points.push({
          month: futureMonth,
          label: toMonthLabel(futureMonth),
          income: null,
          expenses: null,
          projIncome: projectMonthlyAmount(store.incomeRows, futureMonth),
          projExpenses: projectMonthlyAmount(
            store.expenseCategories,
            futureMonth,
          ),
          isProjected: true,
        });
      }
    }

    return points.sort((a, b) => a.month.localeCompare(b.month));
  }, [store.cashFlowHistory, store.incomeRows, store.expenseCategories]);

  const yMax = useMemo(() => {
    const max = Math.max(
      0,
      ...cashFlowChartData.flatMap((d) => [
        d.income ?? 0,
        d.expenses ?? 0,
        d.projIncome ?? 0,
        d.projExpenses ?? 0,
      ]),
    );
    return Math.ceil((max * 1.2) / 1000) * 1000 || 10000;
  }, [cashFlowChartData]);

  const todayMonthLabel = useMemo(
    () => toMonthLabel(addMonthStr(new Date(), 0)),
    [],
  );

  // ── Goals ─────────────────────────────────────────────────────────────────

  const topGoals = useMemo(
    () => store.goals.filter((g) => !g.completed).slice(0, 3),
    [store.goals],
  );

  // ── Upcoming & activity ───────────────────────────────────────────────────

  const upcoming: UpcomingItem[] = useMemo(() => {
    const items: UpcomingItem[] = [];
    if (items.length === 0)
      items.push({ id: "u-fallback", title: "No upcoming items", time: "-" });
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
    return rows;
  }, [store.goals, store.incomeRows]);

  // ── Greeting ──────────────────────────────────────────────────────────────

  const greetingName = useMemo(() => {
    const accountMode = store.user?.account_mode ?? "solo";
    const full = store.user?.display_name ?? "";

    if (!full) {
      const prefix = (auth.email ?? "").split("@")[0] ?? "";
      return prefix.replace(/[._-]+/g, " ").trim();
    }

    // For solo accounts take first name only
    // For household accounts use the full display name
    if (accountMode === "solo") {
      return full.split(" ")[0] ?? full;
    }

    return full; // "The Johnsons", "John & Ama" etc
  }, [store.user?.display_name, store.user?.account_mode, auth.email]);

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

  if (stripeReturnState === "confirming") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
        <div>
          <p className="text-base font-medium">Confirming your subscription…</p>
          <p className="text-sm text-muted-foreground mt-1">
            This usually takes just a few seconds. Please don&apos;t close this
            tab.
          </p>
        </div>
      </div>
    );
  }

  if (stripeReturnState === "timeout") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-base font-medium">
          Payment received - we&apos;re still activating your account.
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          This is taking longer than expected. Your subscription will be enabled
          automatically once Stripe finishes confirming the payment.
        </p>
        <Button
          onClick={() => window.location.replace("/dashboard")}
          variant="outline"
        >
          Refresh
        </Button>
      </div>
    );
  }

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
            className="flex flex-col gap-4 @2xl/dash:flex-row @2xl/dash:items-start @2xl/dash:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {store.user?.account_mode !== "solo" ? "Welcome in," : "Hi"}
                {greetingName ? ` ${greetingName}` : ""},
              </p>
              <h1 className="text-3xl @md/dash:text-4xl font-semibold tracking-tight">
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
              loading={loading}
              items={[
                {
                  label: "Net Worth",
                  value: hasAssets ? formatCurrency(snapshot.netWorth) : "-",
                  subline: hasAssets
                    ? "Assets minus liabilities"
                    : "Complete your profile to calculate your net worth",
                  tone: hasAssets
                    ? snapshot.netWorth >= 0
                      ? "good"
                      : "danger"
                    : "neutral",
                  onClick: hasAssets
                    ? () => router.push("/dashboard/cash-flow")
                    : () => router.push("/dashboard/profile/setup"),
                },
                {
                  label: "Portfolio Value",
                  value:
                    store.holdings.length === 0
                      ? "-"
                      : formatCurrency(snapshot.portfolioValue),
                  subline:
                    store.holdings.length === 0
                      ? "Add assets to track your portfolio"
                      : `${store.holdings.filter((h) => h.is_active).length} active holdings`,
                  tone: "neutral",
                  onClick: () => router.push("/dashboard/assets"),
                },
                {
                  label: "Monthly Surplus",
                  value:
                    snapshot.monthlyIncome === 0 &&
                    snapshot.monthlyExpenses === 0
                      ? "-"
                      : formatCurrency(snapshot.monthlyCashFlow),
                  subline:
                    snapshot.monthlyIncome === 0 &&
                    snapshot.monthlyExpenses === 0
                      ? "Add income and expenses to see your surplus"
                      : store.expenseCategories.length === 0
                        ? "Add expenses to see your surplus"
                        : `${formatCurrency(snapshot.monthlyIncome)} in · ${formatCurrency(snapshot.monthlyExpenses)} out`,
                  tone:
                    snapshot.monthlyIncome === 0 &&
                    snapshot.monthlyExpenses === 0
                      ? "neutral"
                      : snapshot.monthlyCashFlow >= 0
                        ? "good"
                        : "danger",
                  onClick: () => router.push("/dashboard/cash-flow"),
                },
                {
                  label: "Emergency Fund",
                  value: !store.emergencyFund.currentCashBalance
                    ? "Not set up"
                    : store.expenseCategories.length === 0
                      ? formatCurrency(efMetrics.currentBalance)
                      : efMetrics.runwayMonths > 9
                        ? "9+ mo runway"
                        : `${Math.round(efMetrics.runwayMonths * 10) / 10}mo runway`,
                  subline: !store.emergencyFund.currentCashBalance
                    ? "Set up your emergency fund"
                    : store.expenseCategories.length === 0
                      ? "Add expenses to calculate runway"
                      : efMetrics.funded
                        ? `${formatCurrency(efMetrics.currentBalance)} · Fully funded`
                        : `${formatCurrency(Math.abs(efMetrics.shortfallOrSurplus))} short of ${efMetrics.targetMonths}mo target`,
                  tone: !store.emergencyFund.currentCashBalance
                    ? "neutral"
                    : store.expenseCategories.length === 0
                      ? "neutral"
                      : efMetrics.funded
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
          <div className="grid grid-cols-1 @5xl/dash:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="@5xl/dash:col-span-8 space-y-6">
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
                      {loading ? (
                        <>
                          <Skeleton className="h-8 w-28" />
                          <Skeleton className="h-8 w-28" />
                          <Skeleton className="h-8 w-28" />
                          <Skeleton className="h-8 w-28" />
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 pt-1 flex-wrap">
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
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <svg width="24" height="8" className="overflow-visible">
                          <line
                            x1="0"
                            y1="4"
                            x2="24"
                            y2="4"
                            stroke={INCOME_COLOR}
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            opacity="0.55"
                          />
                        </svg>
                        Projected
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-2 pt-2 sm:px-6">
                    {snapshot.monthlyIncome === 0 &&
                    snapshot.monthlyExpenses === 0 ? (
                      <EmptyNudge
                        message="Set up your income and expenses to see your projected cash flow."
                        buttonLabel="Set up cash flow"
                        onAction={() => router.push("/dashboard/cash-flow")}
                      />
                    ) : (
                      <ChartContainer
                        config={cashFlowChartConfig}
                        className="aspect-auto h-55 w-full"
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
                          {/* Today reference line */}
                          <ReferenceLine
                            x={todayMonthLabel}
                            stroke={INCOME_COLOR}
                            strokeOpacity={0.3}
                            strokeDasharray="4 3"
                            label={{
                              value: "Today",
                              position: "top",
                              offset: 10,
                              fontSize: 10,
                              fill: "var(--muted-foreground)",
                            }}
                          />
                          {/* Actual data lines */}
                          <Line
                            dataKey="income"
                            type="monotone"
                            stroke={INCOME_COLOR}
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                          />
                          <Line
                            dataKey="expenses"
                            type="monotone"
                            stroke={EXPENSES_COLOR}
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                          />
                          {/* Projected lines - dashed */}
                          <Line
                            dataKey="projIncome"
                            type="monotone"
                            stroke={INCOME_COLOR}
                            strokeWidth={2}
                            strokeDasharray="4 3"
                            strokeOpacity={0.55}
                            dot={false}
                            connectNulls
                            legendType="none"
                          />
                          <Line
                            dataKey="projExpenses"
                            type="monotone"
                            stroke={EXPENSES_COLOR}
                            strokeWidth={2}
                            strokeDasharray="4 3"
                            strokeOpacity={0.55}
                            dot={false}
                            connectNulls
                            legendType="none"
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
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
                    {store.goals.length === 0 ? (
                      <EmptyNudge
                        message="You haven't set any financial goals yet. Goals help guide every financial decision."
                        buttonLabel="Add your first goal"
                        onAction={() => router.push("/dashboard/goals")}
                      />
                    ) : (
                      <>
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
                                  <span className="font-medium">
                                    {goal.title}
                                  </span>
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
                      </>
                    )}
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
                    {store.goals.length === 0 &&
                    store.incomeRows.length === 0 ? (
                      <EmptyNudge
                        message="Your activity will appear here as you add income, expenses, and goals."
                        buttonLabel="Get started"
                        onAction={() => router.push("/dashboard/profile/setup")}
                      />
                    ) : (
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
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right column */}
            <div className="@5xl/dash:col-span-4 space-y-6">
              {/* Retirement */}
              <motion.div variants={mi}>
                <SectionLabel>Retirement</SectionLabel>
                <Card
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => router.push("/dashboard/retirement")}
                >
                  <CardContent className="pt-5 space-y-4">
                    {store.retirement.retirementAge === 0 &&
                    store.retirement.desiredMonthlyIncome === 0 ? (
                      <EmptyNudge
                        message="Complete your retirement plan to see your projected balance and track whether you're on track."
                        buttonLabel="Set up retirement"
                        onAction={() => router.push("/dashboard/retirement")}
                      />
                    ) : (
                      <>
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
                            value={formatCurrency(
                              store.retirement.monthlySavings,
                            )}
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
                      </>
                    )}
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

                    {store.insurancePolicies.length === 0 ? (
                      <EmptyNudge
                        message="No insurance policies added yet. Add your policies to track coverage and renewals."
                        buttonLabel="Add a policy"
                        onAction={() => router.push("/dashboard/insurance")}
                      />
                    ) : (
                      <>
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

                        {store.insurancePolicies.filter((p) => p.is_active)
                          .length > 4 && (
                          <p className="text-xs text-muted-foreground pt-1">
                            +
                            {store.insurancePolicies.filter((p) => p.is_active)
                              .length - 4}{" "}
                            more policies
                          </p>
                        )}
                      </>
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
