"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, CalendarDays } from "lucide-react";

import { useClientGate } from "@/lib/useClientGate";
import { canAccessFeature, formatCurrency } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";

import { SessionOverviewHero } from "@/components/dashboard/advisor/session-overview-hero";
import { UpcomingSessionCard } from "@/components/dashboard/advisor/upcoming-session-card";
import { LastSessionSummaryCard } from "@/components/dashboard/advisor/last-session-summary-card";
import { RecommendedActionsCard } from "@/components/dashboard/advisor/recommended-actions-card";
import { ProgressSinceSessionCard } from "@/components/dashboard/advisor/progress-since-session-card";
import { SessionHistoryCard } from "@/components/dashboard/advisor/session-history-card";
import { SessionDocumentsCard } from "@/components/dashboard/advisor/session-documents-card";
import type { ProgressMetric } from "@/components/dashboard/advisor/progress-since-session-card";

import type { ActionItem } from "@/components/dashboard/advisor/types";
import {
  MOCK_ALLOCATION,
  MOCK_UPCOMING,
  MOCK_LAST_SESSION,
  MOCK_HISTORY,
  MOCK_ALL_DOCS,
  MOCK_PROGRESS_RAW,
} from "@/lib/advisory-mock";

// ── Motion variants ───────────────────────────────────────────────────────────

const pageEnter = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stagger = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const PRIMARY = "rgb(27, 24, 86)";
const ACCENT = "rgb(140, 128, 248)";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdvisoryPage() {
  const router = useRouter();
  const { ready, auth, sub } = useClientGate();
  const currency = useFinancialStore((s) => s.user?.currency ?? "USD");

  const isTrial = sub.status === "trialing" || sub.status === "none";
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);
  const [actionItems, setActionItems] = React.useState<ActionItem[]>(
    MOCK_LAST_SESSION.actionItems,
  );

  // Build progress metrics with the user's currency
  const progressMetrics: ProgressMetric[] = React.useMemo(
    () =>
      MOCK_PROGRESS_RAW.map((m) => {
        if (!m.isCurrency) {
          return {
            label: m.label,
            before: `${m.beforeAmount}%`,
            after: `${m.afterAmount}%`,
            direction: m.direction,
            positiveDirection: m.positiveDirection,
            changeLabel: m.changeLabel ?? "",
          };
        }
        const diff = m.afterAmount - m.beforeAmount;
        const sign = diff >= 0 ? "+" : "";
        return {
          label: m.label,
          before: formatCurrency(m.beforeAmount, currency),
          after: formatCurrency(m.afterAmount, currency),
          direction: m.direction,
          positiveDirection: m.positiveDirection,
          changeLabel: `${sign}${formatCurrency(Math.abs(diff), currency)}`,
        };
      }),
    [currency],
  );

  function handleBook() {
    if (isTrial) {
      setShowUpgradePrompt(true);
      return;
    }
    setShowUpgradePrompt(false);
  }

  function handleToggleAction(id: string) {
    setActionItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    );
  }

  if (!ready) return null;

  if (!auth.loggedIn) {
    router.replace("/");
    return null;
  }

  if (!canAccessFeature(sub, "advisorChat")) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <div
            className="mx-auto h-12 w-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(27,24,86,0.08)" }}
          >
            <Lock className="h-5 w-5" style={{ color: PRIMARY }} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: PRIMARY }}>
            Advisory sessions
          </h2>
          <p className="text-sm text-muted-foreground">
            Access to your dedicated advisor is available on paid plans. Upgrade
            to book sessions, review your financial plan, and get personalised
            recommendations.
          </p>
          <Button
            onClick={() => {
              try {
                window.localStorage.setItem("upgrade_intent", "true");
              } catch {}
              router.push("/choose-plan");
            }}
            className="gap-2 text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Upgrade to access advisory <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-4 py-8 md:px-6">
      {/* Page title */}
      <motion.div
        variants={pageEnter}
        initial="hidden"
        animate="show"
        className="mb-6"
      >
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: PRIMARY }}
        >
          Advisory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your private advisory sessions, history, and action plan.
        </p>
      </motion.div>

      {/* Session overview hero */}
      <motion.div
        variants={pageEnter}
        initial="hidden"
        animate="show"
        className="mb-6"
      >
        <SessionOverviewHero
          allocation={MOCK_ALLOCATION}
          isTrial={isTrial}
          onBook={handleBook}
        />

        {showUpgradePrompt && (
          <div
            className="mt-3 rounded-xl border px-4 py-3 flex items-start gap-3"
            style={{
              backgroundColor: "rgba(27,24,86,0.04)",
              borderColor: "rgba(140,128,248,0.3)",
            }}
          >
            <Lock
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: ACCENT }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: PRIMARY }}>
                Upgrade to book a session
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Advisory sessions are included in paid plans. Upgrade to access
                your dedicated advisor.
              </p>
            </div>
            <Button
              size="sm"
              className="text-xs h-8 shrink-0 text-white"
              style={{ backgroundColor: PRIMARY }}
              onClick={() => {
                try {
                  window.localStorage.setItem("upgrade_intent", "true");
                } catch {}
                router.push("/choose-plan");
              }}
            >
              Upgrade
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {/* Upcoming session - empty state if user hasn't booked yet */}
        <motion.div variants={itemVariant}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Next session
          </p>
          {MOCK_UPCOMING ? (
            <UpcomingSessionCard session={MOCK_UPCOMING} />
          ) : (
            <DashCard>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: PRIMARY }}>
                  No session scheduled
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You have{" "}
                  {MOCK_ALLOCATION.totalIncluded - MOCK_ALLOCATION.used} session
                  {MOCK_ALLOCATION.totalIncluded - MOCK_ALLOCATION.used !== 1
                    ? "s"
                    : ""}{" "}
                  remaining. Book it when you are ready.
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-dashed border-muted/60 py-8 flex flex-col items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(140,128,248,0.1)" }}
                  >
                    <CalendarDays
                      className="h-5 w-5"
                      style={{ color: ACCENT }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Sessions are flexible. Request a time that suits you and
                    your advisor will confirm within 1 - 2 business days.
                  </p>
                  <Button
                    size="sm"
                    className="mt-1 gap-1.5 text-white text-xs"
                    style={{ backgroundColor: PRIMARY }}
                    onClick={handleBook}
                  >
                    <CalendarDays className="h-3.5 w-3.5" /> Request a session
                  </Button>
                </div>
              </CardContent>
            </DashCard>
          )}
        </motion.div>

        {/* Last session summary */}
        <motion.div variants={itemVariant}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Last session
          </p>
          <LastSessionSummaryCard session={MOCK_LAST_SESSION} />
        </motion.div>

        {/* Recommended actions + progress side by side on large screens */}
        <motion.div variants={itemVariant}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Your plan
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecommendedActionsCard
              items={actionItems}
              onToggle={handleToggleAction}
            />
            <ProgressSinceSessionCard
              sinceDate={MOCK_LAST_SESSION.date}
              metrics={progressMetrics}
            />
          </div>
        </motion.div>

        {/* Advisory history */}
        <motion.div variants={itemVariant}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            History
          </p>
          <SessionHistoryCard sessions={MOCK_HISTORY} />
        </motion.div>

        {/* Documents */}
        <motion.div variants={itemVariant}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Documents
          </p>
          <SessionDocumentsCard documents={MOCK_ALL_DOCS} />
        </motion.div>
      </motion.div>
    </div>
  );
}
