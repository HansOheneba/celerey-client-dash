"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  Download,
  LineChart,
  Sparkles,
  Wallet,
  Goal,
  Shield,
  MessageSquareText,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useClientGate } from "../../lib/useClientGate";
import { canAccessFeature, type FeatureKey } from "../../lib/entitlements";
import {
  getClientData,
  goalsData,
  cashFlowData,
  advisorData,
} from "@/lib/client-data";
import { mockHoldings, mockValuations, currentValue } from "@/lib/asset-data";
import { mockUser, getUserFullName } from "@/lib/user-data";
import { mockProperties } from "@/lib/property-data";
import { mockInsurancePolicies } from "@/lib/insurance-data";
import {
  createNetWorthSnapshot,
  recordNetWorthSnapshot,
  getLatestNetWorthChange,
} from "@/lib/net-worth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import QuizCard from "@/components/dashboard/risk/quizCard";

type Snapshot = {
  netWorth: number;
  portfolioValue: number;
  monthlyCashFlow: number;
  goalsActive: number;
  goalsTotal: number;
  goalsCompleted: number;
  insurancePolicies: number;
};

type UpcomingItem = {
  id: string;
  title: string;
  time: string;
  meta?: string;
};

type ActivityRow = {
  id: string;
  title: string;
  category: "Goal" | "Portfolio" | "Cash Flow" | "Insurance";
  date: string;
  status: "Pending" | "Completed";
};

function formatMoneyGhs(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(safe);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
        // noop
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

  const snapshot: Snapshot = useMemo(() => {
    const client = getClientData();

    const income = cashFlowData.income.reduce((s, i) => s + i.amount, 0);
    const expenses = cashFlowData.expenses.reduce((s, e) => s + e.amount, 0);

    const nw = createNetWorthSnapshot();

    // Compute portfolio value from holdings & valuations (matches Portfolio page)
    const holdings = mockHoldings.filter((h) => h.is_active);
    const portfolioValue = holdings.reduce(
      (s, h) => s + currentValue(h, mockValuations),
      0,
    );

    // Count insurance policies: active general policies + property insurances
    const generalActivePolicies = mockInsurancePolicies.filter(
      (p) => p.is_active,
    ).length;
    const propertyInsCount = mockProperties
      .filter((p) => p.is_active)
      .reduce((sum, p) => sum + (p.insurance?.length ?? 0), 0);

    return {
      netWorth: nw.netWorth ?? client.computed?.totalNetWorth ?? 0,
      portfolioValue: portfolioValue ?? client.portfolio?.totalValue ?? 0,
      monthlyCashFlow: Math.round(income - expenses),
      goalsActive: goalsData.goals.filter((g) => !g.completed).length,
      goalsTotal: goalsData.goals.length,
      goalsCompleted: goalsData.goals.filter((g) => g.completed).length,
      insurancePolicies: generalActivePolicies + propertyInsCount,
    } as Snapshot;
  }, []);

  const [netWorthPercent, setNetWorthPercent] = React.useState<number | null>(
    null,
  );

  const [netWorthChangeText, setNetWorthChangeText] = React.useState<
    string | null
  >(null);

  useEffect(() => {
    if (!ready) return;
    if (!auth.loggedIn) return;

    try {
      // record a snapshot (dedupe per day) and compute change vs previous
      recordNetWorthSnapshot({ dedupeDays: 1 });
      const change = getLatestNetWorthChange();
      if (change && change.percent !== null && change.since) {
        const upDown =
          change.percent > 0 ? "up" : change.percent < 0 ? "down" : "no change";
        const pct = Math.abs(change.percent).toFixed(1);
        const sinceDate = new Date(change.since).toLocaleDateString();
        setNetWorthChangeText(
          `Your net worth is ${upDown} ${pct}% since ${sinceDate}`,
        );
        setNetWorthPercent(change.percent);
      }
    } catch {
      // noop
    }
  }, [ready, auth.loggedIn]);

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

    if (advisorData.actionItems && advisorData.actionItems.length > 0) {
      const ai = advisorData.actionItems[0];
      items.push({
        id: `action-${ai.id}`,
        title: ai.label,
        time: ai.dueLabel,
        meta: "Action",
      });
    }

    if (items.length === 0) {
      items.push({ id: "u-fallback", title: "No upcoming items", time: "—" });
    }

    return items;
  }, []);

  const activity: ActivityRow[] = useMemo(() => {
    const rows: ActivityRow[] = [];

    goalsData.goals.slice(0, 3).forEach((g) =>
      rows.push({
        id: `g-${g.id}`,
        title: g.completed ? `Completed ${g.title}` : `${g.title} updated`,
        category: "Goal",
        date: g.completedDate ?? new Date().toLocaleDateString(),
        status: g.completed ? "Completed" : "Pending",
      }),
    );

    cashFlowData.income.slice(0, 2).forEach((c) =>
      rows.push({
        id: `c-${c.id}`,
        title: `New ${c.name} entry`,
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
  }, []);

  const greetingName = useMemo(() => {
    const client = getClientData();
    const full = client.personal?.name ?? "";
    if (full) return full.split(" ")[0] ?? "";

    const email = auth.email?.trim();
    if (!email) return "";
    const prefix = email.split("@")[0] ?? "";
    const cleaned = prefix.replace(/[._-]+/g, " ").trim();
    if (!cleaned) return email;
    return cleaned
      .split(" ")
      .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : ""))
      .join(" ");
  }, [auth.email]);

  const timeGreeting = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 18) return "Good Afternoon!";
    return "Good Evening!";
  }, []);

  const motionContainer = useMemo(() => {
    if (reduceMotion) return undefined;
    return {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.05 },
      },
    };
  }, [reduceMotion]);

  const motionItem = useMemo(() => {
    if (reduceMotion) return undefined;
    return {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    };
  }, [reduceMotion]);

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : "hidden"}
      animate={reduceMotion ? undefined : "show"}
      variants={motionContainer}
      className="w-full"
    >
      <div className="mx-auto px-6 py-8 space-y-6">
        <motion.div variants={motionItem} className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Hi{greetingName ? ` ${greetingName}` : ""},{" "}
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {timeGreeting}
              </h1>
              <div>
                <p className="text-sm text-muted-foreground">
                  Here is your account snapshot and what is next.
                </p>
                {/* Enhanced net worth snapshot */}
                <div className="text-base font-medium flex items-center gap-2 mt-1">
                  {netWorthPercent !== null ? (
                    <>
                      {netWorthPercent > 0 ? (
                        <ArrowUp className="h-5 w-5 text-green-600" />
                      ) : netWorthPercent < 0 ? (
                        <ArrowDown className="h-5 w-5 text-red-600" />
                      ) : (
                        <span className="h-5 w-5" />
                      )}
                      <span
                        className={
                          netWorthPercent > 0
                            ? "text-green-600"
                            : netWorthPercent < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }
                      >
                        {netWorthPercent > 0
                          ? `Up by ${Math.abs(netWorthPercent).toFixed(1)}%`
                          : netWorthPercent < 0
                            ? `Down by ${Math.abs(netWorthPercent).toFixed(1)}%`
                            : "No change"}
                        <span className="text-xs text-muted-foreground ml-2">
                          (this month)
                        </span>
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {getUserFullName(mockUser)}, {mockUser.occupation},{" "}
                        {mockUser.marital_status}, {mockUser.risk_profile} risk
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>12 Jan 2023 • 12 Jan 2024</span>
              </div>

              <Button
                className="gap-2"
                variant="secondary"
                onClick={() => {
                  if (access.exportData) {
                    router.push("/export");
                    return;
                  }
                  handleUpgradeIntent();
                }}
              >
                Export <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-4">
            <motion.div variants={motionItem}>
              <MetricCard
                title="Net worth"
                value={formatMoneyGhs(snapshot.netWorth)}
                valueClassName="text-primary"
                trend={
                  netWorthPercent !== null
                    ? {
                        value: `${Math.abs(netWorthPercent).toFixed(1)}%`,
                        dir:
                          netWorthPercent > 0
                            ? "up"
                            : netWorthPercent < 0
                              ? "down"
                              : "flat",
                      }
                    : undefined
                }
                icon={<Wallet className="h-5 w-5" />}
                helper="Assets minus liabilities"
                onOpen={() => router.push("/dashboard/cash-flow")}
              />
            </motion.div>

            <motion.div variants={motionItem}>
              <MetricCard
                title="Goals active"
                value={`${snapshot.goalsActive} / ${snapshot.goalsTotal}`}
                valueClassName="text-primary"
                helper={`Active ${snapshot.goalsActive} • Total ${snapshot.goalsTotal} • Completed ${snapshot.goalsCompleted}`}
                icon={<Goal className="h-5 w-5" />}
                onOpen={() => router.push("dashboard/goals")}
              />
            </motion.div>

            <motion.div variants={motionItem}>
              <MetricCard
                title="Portfolio value"
                value={formatMoneyGhs(snapshot.portfolioValue)}
                icon={<LineChart className="h-5 w-5" />}
                helper="Investments and holdings"
                onOpen={() => router.push("/dashboard/assets")}
              />
            </motion.div>

            <motion.div variants={motionItem}>
              <MetricCard
                title="Insurance policies"
                value={`${snapshot.insurancePolicies}`}
                icon={<Shield className="h-5 w-5" />}
                helper="Coverage overview"
                onOpen={() => router.push("/dashboard/insurance")}
              />
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div variants={motionItem} className="h-full">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">Performance</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open performance"
                      onClick={() => router.push("/performance")}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Portfolio and cash flow trend for the selected period.
                  </div>

                  <div className="h-65 rounded-md border flex items-center justify-center text-sm text-muted-foreground">
                    Chart placeholder
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-3">
                    <MiniStat
                      label="Monthly cash flow"
                      value={formatMoneyGhs(snapshot.monthlyCashFlow)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <motion.div variants={motionItem}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">Upcoming</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open schedule"
                      onClick={() => router.push("/schedule")}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {upcoming.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border px-3 py-3 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.time}
                          {item.meta ? ` • ${item.meta}` : ""}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open item"
                        onClick={() => router.push("/schedule")}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={() => router.push("/schedule/new")}
                  >
                    Add new schedule <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={motionItem}>
              <LockedFeatureCard
                title="Advisor"
                description="Talk to an advisor for guidance and planning."
                icon={<MessageSquareText className="h-5 w-5" />}
                hasAccess={access.advisorChat}
                onOpen={() => router.push("/advisor")}
                onUpgrade={handleUpgradeIntent}
              />
            </motion.div>

            {/* ✅ REPLACED: AI insights -> Risk attitude quiz card */}
            <motion.div variants={motionItem}>
              <QuizCard />
            </motion.div>
          </div>
        </div>

        <motion.div variants={motionItem}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg">Recent activity</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open activity"
                  onClick={() => router.push("/activity")}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3 pr-4 font-medium">Item</th>
                      <th className="py-3 pr-4 font-medium">Category</th>
                      <th className="py-3 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((row) => (
                      <tr key={row.id} className="border-b last:border-b-0">
                        <td className="py-3 pr-4">
                          <div className="font-medium">{row.title}</div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {row.category}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {row.date}
                        </td>
                        <td className="py-3 pr-4">{row.status}</td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open row"
                            onClick={() => router.push("/activity")}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
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
    </motion.div>
  );
}

function MetricCard(props: {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  onOpen: () => void;
  valueClassName?: string;
  trend?: { value?: string; dir?: "up" | "down" | "flat" } | null;
}) {
  const { title, value, helper, icon, onOpen, valueClassName, trend } = props;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">{icon}</div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open ${title}`}
            onClick={onOpen}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "text-2xl font-semibold tracking-tight",
              valueClassName,
            )}
          >
            {value}
          </div>
          {trend ? (
            <div className="text-xs flex items-center gap-1">
              {trend.dir === "up" ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : trend.dir === "down" ? (
                <ArrowDown className="h-4 w-4 text-red-600" />
              ) : null}
              <div
                className={cn(
                  "font-medium",
                  trend.dir === "up"
                    ? "text-green-600"
                    : trend.dir === "down"
                      ? "text-red-600"
                      : "text-muted-foreground",
                )}
              >
                {trend.value}
              </div>
            </div>
          ) : null}
        </div>

        <div className="text-xs text-muted-foreground">{helper}</div>
      </CardContent>
    </Card>
  );
}

function LockedFeatureCard(props: {
  title: string;
  description: string;
  icon: React.ReactNode;
  hasAccess: boolean;
  onOpen: () => void;
  onUpgrade: () => void;
}) {
  const { title, description, icon, hasAccess, onOpen, onUpgrade } = props;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">{icon}</div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label={`Open ${title}`}
            onClick={() => {
              if (hasAccess) onOpen();
              else onUpgrade();
            }}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>

        {hasAccess ? (
          <Button className="w-full justify-between" onClick={onOpen}>
            Open <ArrowUpRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="w-full justify-between"
            onClick={onUpgrade}
            style={{ background: "#0B102A", boxShadow: "none" }}
          >
            Upgrade to Premium <ArrowUpRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat(props: { label: string; value: string }) {
  const { label, value } = props;
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}
