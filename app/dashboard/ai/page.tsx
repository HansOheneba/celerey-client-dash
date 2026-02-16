"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { aiInsights } from "@/lib/client-data";

type Priority = "high" | "medium" | "low";
type InsightKind = "opportunity" | "risk" | "milestone" | "action";

type Insight = {
  id: string;
  kind: InsightKind;
  title: string;
  description: string;
  priority: Priority;
  cta?: { label: string; onClick?: () => void };
};

const container = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const KIND_META: Record<
  InsightKind,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    chip: string;
    chipText: string;
    iconWrap: string;
    iconColor: string;
  }
> = {
  opportunity: {
    label: "OPPORTUNITY",
    Icon: TrendingUp,
    chip: "bg-emerald-50/60 border-emerald-200/60",
    chipText: "text-emerald-700 dark:text-emerald-500",
    iconWrap: "bg-emerald-50/60 border-emerald-200/60",
    iconColor: "text-emerald-700 dark:text-emerald-500",
  },
  risk: {
    label: "RISK",
    Icon: AlertTriangle,
    chip: "bg-amber-50/60 border-amber-200/60",
    chipText: "text-amber-700 dark:text-amber-500",
    iconWrap: "bg-amber-50/60 border-amber-200/60",
    iconColor: "text-amber-700 dark:text-amber-500",
  },
  milestone: {
    label: "MILESTONE",
    Icon: CheckCircle2,
    chip: "bg-sky-50/60 border-sky-200/60",
    chipText: "text-sky-700 dark:text-sky-500",
    iconWrap: "bg-sky-50/60 border-sky-200/60",
    iconColor: "text-sky-700 dark:text-sky-500",
  },
  action: {
    label: "ACTION",
    Icon: Clock3,
    chip: "bg-muted/30 border-muted/60",
    chipText: "text-muted-foreground",
    iconWrap: "bg-muted/30 border-muted/60",
    iconColor: "text-muted-foreground",
  },
};

function PriorityPill({ priority }: { priority: Priority }) {
  const meta =
    priority === "high"
      ? {
          label: "high priority",
          cls: "bg-rose-50/60 border-rose-200/60 text-rose-700 dark:text-rose-500",
        }
      : priority === "medium"
        ? {
            label: "medium priority",
            cls: "bg-amber-50/60 border-amber-200/60 text-amber-700 dark:text-amber-500",
          }
        : {
            label: "low priority",
            cls: "bg-muted/30 border-muted/60 text-muted-foreground",
          };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        meta.cls,
      )}
    >
      {meta.label}
    </span>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const meta = KIND_META[insight.kind];
  const Icon = meta.Icon;

  return (
    <motion.div variants={item}>
      <Card className="border-muted/60 bg-background/60 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                meta.iconWrap,
              )}
              aria-hidden
            >
              <Icon className={cn("h-5 w-5", meta.iconColor)} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-[11px] font-semibold tracking-widest",
                      meta.chipText,
                    )}
                  >
                    {meta.label}
                  </div>
                  <div className="mt-1 text-base font-semibold tracking-tight">
                    {insight.title}
                  </div>
                </div>

                <div className="shrink-0">
                  <PriorityPill priority={insight.priority} />
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {insight.description}
              </p>

              {insight.cta ? (
                <div className="mt-5">
                  <Button
                    onClick={insight.cta.onClick}
                    className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    {insight.cta.label}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AIInsightsIntelligencePage() {
  const insights: Insight[] = aiInsights.map((insight) => ({
    ...insight,
    cta: insight.cta ? { ...insight.cta, onClick: () => {} } : undefined,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header (matches your other page) */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Celerey Insights &amp; Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations for your financial strategy.
          </p>
        </div>

        {/* Optional filter row (minimal) */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">All</Badge>
          <Badge variant="outline" className="bg-background/60">
            Opportunities
          </Badge>
          <Badge variant="outline" className="bg-background/60">
            Risks
          </Badge>
          <Badge variant="outline" className="bg-background/60">
            Milestones
          </Badge>
          <Badge variant="outline" className="bg-background/60">
            Actions
          </Badge>
        </div>

        {/* List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-6 space-y-4"
        >
          {insights.map((x) => (
            <InsightRow key={x.id} insight={x} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
