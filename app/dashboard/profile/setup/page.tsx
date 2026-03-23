"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  User,
  Banknote,
  CreditCard,
  Target,
  UmbrellaIcon,
  TrendingDown,
  PiggyBank,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { useFinancialStore } from "@/store/financialStore";

// ─── Checklist item shape ─────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: React.ReactNode;
  completed: boolean;
}

// ─── Section ──────────────────────────────────────────────────────────────

function ChecklistSection({
  title,
  items,
}: {
  title: string;
  items: ChecklistItem[];
}) {
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <Badge variant="secondary" className="text-[11px]">
          {completedCount}/{items.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  return (
    <Card className={item.completed ? "opacity-60" : ""}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 ${item.completed ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </div>

          <div
            className={`p-2 rounded-lg shrink-0 ${item.completed ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-muted text-muted-foreground"}`}
          >
            {item.icon}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
            >
              {item.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {item.description}
            </p>
          </div>

          {!item.completed && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5 text-xs"
            >
              <Link href={item.href}>
                {item.actionLabel}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const store = useFinancialStore();

  const identityComplete =
    !!store.user?.display_name &&
    !!store.user?.email &&
    !!store.user?.resident_country;
  const hasIncome = store.incomeRows.length > 0;
  const hasExpenses = store.expenseCategories.length > 0;
  const hasGoals = store.goals.length > 0;
  const retirementBasicsComplete =
    store.retirement.desiredMonthlyIncome > 0 &&
    store.retirement.retirementAge > 0;
  const retirementDetailComplete =
    store.retirement.currentInvested > 0 ||
    store.retirement.existingPensionBalance > 0;
  const hasLiabilities = store.liabilities.length > 0;
  const hasEmergencyFund = store.emergencyFund.currentCashBalance > 0;
  const hasAssets = store.holdings.length > 0 || store.accounts.length > 0;
  const hasInsurance = store.insurancePolicies.length > 0;

  const score = store.profileCompletionScore;

  const basicsItems: ChecklistItem[] = [
    {
      id: "identity",
      label: "Tell us about yourself",
      description:
        "Your name, email, and country help us personalise your experience.",
      href: "/dashboard/account/profile",
      actionLabel: "Go to profile",
      icon: <User className="h-4 w-4" />,
      completed: identityComplete,
    },
    {
      id: "income",
      label: "Add your income",
      description:
        "Recording your income is the foundation of your financial picture.",
      href: "/dashboard/cash-flow",
      actionLabel: "Add income",
      icon: <Banknote className="h-4 w-4" />,
      completed: hasIncome,
    },
    {
      id: "expenses",
      label: "Add your expenses",
      description:
        "Track what you spend each month to understand your cash flow.",
      href: "/dashboard/cash-flow",
      actionLabel: "Add expenses",
      icon: <CreditCard className="h-4 w-4" />,
      completed: hasExpenses,
    },
    {
      id: "goals",
      label: "Set your first goal",
      description:
        "Goals give your money direction — a holiday, a home, or financial freedom.",
      href: "/dashboard/goals",
      actionLabel: "Set a goal",
      icon: <Target className="h-4 w-4" />,
      completed: hasGoals,
    },
    {
      id: "retirement-basics",
      label: "Set your retirement target",
      description:
        "Tell us your desired monthly income and target retirement age.",
      href: "/dashboard/retirement",
      actionLabel: "Plan retirement",
      icon: <UmbrellaIcon className="h-4 w-4" />,
      completed: retirementBasicsComplete,
    },
  ];

  const completePictureItems: ChecklistItem[] = [
    {
      id: "retirement-detail",
      label: "Complete your retirement details",
      description:
        "Add your current invested amount and pension balance for a more accurate projection.",
      href: "/dashboard/retirement",
      actionLabel: "Complete details",
      icon: <UmbrellaIcon className="h-4 w-4" />,
      completed: retirementDetailComplete,
    },
    {
      id: "liabilities",
      label: "Add your liabilities",
      description:
        "Mortgages, loans, and credit cards — know exactly what you owe.",
      href: "/dashboard/liabilities",
      actionLabel: "Add liabilities",
      icon: <TrendingDown className="h-4 w-4" />,
      completed: hasLiabilities,
    },
    {
      id: "emergency-fund",
      label: "Set up your emergency fund",
      description:
        "A safety net of 3–6 months of expenses protects you from the unexpected.",
      href: "/dashboard/cash-flow",
      actionLabel: "Configure fund",
      icon: <PiggyBank className="h-4 w-4" />,
      completed: hasEmergencyFund,
    },
    {
      id: "assets",
      label: "Add your first asset",
      description:
        "Stocks, ETFs, crypto, savings — track everything you own in one place.",
      href: "/dashboard/assets",
      actionLabel: "Add assets",
      icon: <Briefcase className="h-4 w-4" />,
      completed: hasAssets,
    },
    {
      id: "insurance",
      label: "Add an insurance policy",
      description:
        "Know what you're covered for and never miss a renewal again.",
      href: "/dashboard/insurance",
      actionLabel: "Add policy",
      icon: <ShieldCheck className="h-4 w-4" />,
      completed: hasInsurance,
    },
  ];

  const totalItems = basicsItems.length + completePictureItems.length;
  const completedItems =
    basicsItems.filter((i) => i.completed).length +
    completePictureItems.filter((i) => i.completed).length;

  const mc = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  };
  const mi = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={mc}
      className="min-h-screen"
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 space-y-8">
        {/* ── Header ── */}
        <motion.div variants={mi} className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete your profile
          </h1>
          <p className="text-sm text-muted-foreground">
            The more we know, the better we can guide you. Every step unlocks
            deeper insights.
          </p>
        </motion.div>

        {/* ── Score card ── */}
        <motion.div variants={mi}>
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Profile completeness
                    </p>
                    <span className="text-xl font-bold tabular-nums text-[#160b35]">
                      {score}%
                    </span>
                  </div>
                  <Progress value={score} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {completedItems} of {totalItems} sections complete
                    {score === 100
                      ? " — your profile is fully set up!"
                      : " — keep going!"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Financial basics ── */}
        <motion.div variants={mi}>
          <ChecklistSection title="Financial basics" items={basicsItems} />
        </motion.div>

        <Separator />

        {/* ── Complete your picture ── */}
        <motion.div variants={mi}>
          <ChecklistSection
            title="Complete your picture"
            items={completePictureItems}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
