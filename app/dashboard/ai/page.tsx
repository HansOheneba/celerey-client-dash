"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Sparkles,
  Send,
  User,
  BarChart2,
  Target,
  Shield,
  PiggyBank,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientGate } from "@/lib/useClientGate";
import {
  canAccessFeature,
  formatCurrency,
  calculateNetWorth,
  currentValue,
} from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type Priority = "high" | "medium" | "low";
type InsightKind = "opportunity" | "risk" | "milestone" | "action";

type Insight = {
  id: string;
  kind: InsightKind;
  title: string;
  description: string;
  priority: Priority;
  cta?: string;
};

type ChatMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: Date;
};

// ── Kind metadata ─────────────────────────────────────────────────────────────

const KIND_META: Record<
  InsightKind,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    dot: string;
  }
> = {
  opportunity: {
    label: "Opportunity",
    Icon: TrendingUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  risk: {
    label: "Risk",
    Icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    dot: "bg-amber-500",
  },
  milestone: {
    label: "Milestone",
    Icon: CheckCircle2,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-700",
    dot: "bg-sky-500",
  },
  action: {
    label: "Action needed",
    Icon: Clock3,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
    dot: "bg-rose-500",
  },
};

const PRIORITY_BADGE: Record<Priority, string> = {
  high: "bg-rose-50 text-rose-700 border border-rose-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-slate-100 text-slate-500 border border-slate-200",
};

const SUGGESTED: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}[] = [
  { icon: Target, text: "How can I retire 2 years earlier?" },
  { icon: TrendingUp, text: "What if I increase savings by $2,000/month?" },
  { icon: BarChart2, text: "How should I rebalance my portfolio?" },
  { icon: Shield, text: "Am I adequately insured?" },
  { icon: PiggyBank, text: "What's the fastest way to eliminate my debt?" },
  { icon: Lightbulb, text: "How do I optimise my tax position?" },
];

// ── Insight card ──────────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onClick,
}: {
  insight: Insight;
  onClick: (text: string) => void;
}) {
  const meta = KIND_META[insight.kind];
  const Icon = meta.Icon;

  return (
    <div className="rounded-xl border border-muted/60 bg-background p-4 hover:border-muted hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            meta.iconBg,
          )}
        >
          <Icon className={cn("h-4 w-4", meta.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {meta.label}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium rounded-full px-2 py-0.5",
                PRIORITY_BADGE[insight.priority],
              )}
            >
              {insight.priority}
            </span>
          </div>
          <p className="text-sm font-semibold leading-snug mb-1.5">
            {insight.title}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
          {insight.cta && (
            <button
              onClick={() =>
                onClick(insight.title + " — " + insight.description)
              }
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1e3a5f] hover:underline"
            >
              Ask Celerey AI
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isAI = msg.role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}
    >
      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18163f] overflow-hidden mt-1">
          <img src="https://i.ibb.co/mCs0QnX1/Celerey-Secondary-Symbol-Light-1.png" alt="Celerey" className="h-6 w-6 object-contain" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isAI
            ? "bg-muted/50 text-foreground rounded-tl-sm"
            : "bg-[#18163f] text-white rounded-tr-sm",
        )}
      >
        {msg.text.split("\n").map((line, i) => {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} className={i > 0 ? "mt-1.5" : ""}>
              {parts.map((part, j) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                ),
              )}
            </p>
          );
        })}
      </div>
      {!isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-1">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIInsightsPage() {
  const router = useRouter();
  const { ready, auth, sub } = useClientGate();
  const store = useFinancialStore();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [activeKind, setActiveKind] = React.useState<InsightKind | "all">(
    "all",
  );
  const endRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ── Computed financial snapshot from store ──────────────────────────────────
  const demo = React.useMemo(() => {
    const income = store.incomeRows.reduce((s, i) => s + i.amount, 0);
    const expenses = store.expenseCategories.reduce((s, e) => s + e.amount, 0);
    const surplus = income - expenses;
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
    const totalDebt = store.liabilities.reduce((s, l) => s + l.balance, 0);
    const highIntLiab =
      [...store.liabilities]
        .filter((l) => l.type === "credit_card")
        .sort((a, b) => b.interestRatePct - a.interestRatePct)[0] ?? null;
    const creditCardBalance = highIntLiab?.balance ?? 0;
    const creditCardRate = highIntLiab?.interestRatePct ?? 0;
    const activeInsurance = store.insurancePolicies.filter((p) => p.is_active);
    const insurancePolicies = activeInsurance.length;
    const monthlyInsurancePremium = activeInsurance.reduce(
      (s, p) => s + p.premium_monthly,
      0,
    );
    const firstName =
      store.user?.first_name ??
      store.user?.display_name?.split(" ")[0] ??
      "there";
    return {
      firstName,
      netWorth,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      surplus,
      retirementAge: store.retirement.retirementAge || 60,
      currentAge: store.retirement.currentAge || 0,
      currentInvested: store.retirement.currentInvested || 0,
      monthlySavings: store.retirement.monthlySavings || surplus,
      desiredMonthlyIncome: store.retirement.desiredMonthlyIncome || 0,
      totalDebt,
      creditCardBalance,
      creditCardRate,
      highIntLiab,
      portfolioValue,
      insurancePolicies,
      monthlyInsurancePremium,
      effectiveTaxRate: store.taxProfile.effectiveTaxRatePct,
    };
  }, [store]);

  // ── Dynamic insights from store ─────────────────────────────────────────────
  const insights = React.useMemo((): Insight[] => {
    const list: Insight[] = [];

    // Tax opportunity
    list.push({
      id: "tax",
      kind: "opportunity",
      title: "Optimise Your Tax Position",
      description:
        demo.effectiveTaxRate > 0
          ? `Restructuring through a family trust or maximising pension/ISA contributions could save ~${formatCurrency(Math.round(demo.monthlyIncome * 12 * demo.effectiveTaxRate * 0.01 * 0.1))}/year at your ${demo.effectiveTaxRate}% effective rate.`
          : "Maximising tax-advantaged accounts and reviewing your tax structure can significantly reduce your annual tax liability.",
      priority: "high",
      cta: "Discuss with Advisor",
    });

    // High-interest debt action
    if (demo.creditCardBalance > 0 && demo.highIntLiab) {
      const months = Math.ceil(demo.creditCardBalance / (1500 * 0.7));
      const interestSaved = Math.round(
        (demo.creditCardBalance * demo.creditCardRate) / 100 / 2,
      );
      list.push({
        id: "credit-card",
        kind: "action",
        title: "Eliminate High-Interest Debt",
        description: `${demo.highIntLiab.name} — ${formatCurrency(demo.creditCardBalance)} at ${demo.creditCardRate}% APR. An extra $1,500/month clears it in ~${months} months, saving ~${formatCurrency(interestSaved)} in interest.`,
        priority: "high",
        cta: "Plan Payoff",
      });
    } else if (demo.totalDebt > 0) {
      list.push({
        id: "debt",
        kind: "action",
        title: "Review Your Debt Position",
        description: `You have ${formatCurrency(demo.totalDebt)} in outstanding liabilities. Prioritise paying off high-interest balances first to reduce total interest cost.`,
        priority: "medium",
        cta: "Plan Payoff",
      });
    }

    // Uninsured properties
    const uninsured = store.propertyAssets.filter(
      (p) => p.is_active && p.insurance.length === 0,
    );
    if (uninsured.length > 0) {
      const first = uninsured[0];
      list.push({
        id: "uninsured-prop",
        kind: "risk",
        title: `Uninsured Property${uninsured.length > 1 ? ` (${uninsured.length})` : ""}`,
        description:
          uninsured.length === 1
            ? `${first.name} (${formatCurrency(first.market_value)}) has no insurance. A landlord policy runs ~$80–120/month and covers catastrophic loss.`
            : `${uninsured.length} properties including ${first.name} have no insurance coverage. This is a significant risk exposure.`,
        priority: "high",
        cta: "Add Insurance",
      });
    }

    // Portfolio / concentration risk
    if (demo.portfolioValue > 0) {
      list.push({
        id: "portfolio",
        kind: "risk",
        title: "Review Portfolio Allocation",
        description: `Your ${formatCurrency(demo.portfolioValue)} portfolio should be reviewed for sector concentration. Diversifying across asset classes reduces volatility and improves risk-adjusted returns.`,
        priority: "medium",
        cta: "Review Portfolio",
      });
    }

    // Retirement trajectory
    if (demo.currentInvested > 0 && demo.retirementAge > 0 && demo.currentAge > 0) {
      const yrs = demo.retirementAge - demo.currentAge;
      const projected = Math.round(
        demo.currentInvested * Math.pow(1.07, yrs) +
          demo.monthlySavings * 12 * ((Math.pow(1.07, yrs) - 1) / 0.07),
      );
      const onTrack =
        demo.desiredMonthlyIncome > 0
          ? (projected * 0.04) / 12 >= demo.desiredMonthlyIncome
          : true;
      list.push({
        id: "retirement",
        kind: "opportunity",
        title: `Retirement Trajectory: ${onTrack ? "On Track" : "Needs Attention"}`,
        description: `${formatCurrency(demo.currentInvested)} invested + ${formatCurrency(demo.monthlySavings)}/month → projected ~${formatCurrency(projected)} by age ${demo.retirementAge}. ${onTrack ? "Adding $2,000/month could unlock earlier retirement." : "Consider increasing contributions to meet your desired income target."}`,
        priority: "medium",
        cta: "Explore Scenarios",
      });
    } else {
      list.push({
        id: "retirement",
        kind: "action",
        title: "Set Up Your Retirement Plan",
        description:
          "Configure your retirement age and savings targets to unlock personalised retirement projections and trajectory analysis.",
        priority: "medium",
        cta: "Configure Retirement",
      });
    }

    // Top in-progress goal
    const topGoal = [...store.goals]
      .filter((g) => !g.completed && g.target > 0)
      .sort((a, b) => a.priority - b.priority)[0];
    if (topGoal) {
      const pct = Math.round(((topGoal.current ?? 0) / topGoal.target) * 100);
      list.push({
        id: `goal-${topGoal.id}`,
        kind: pct >= 100 ? "milestone" : "opportunity",
        title: `Goal: ${topGoal.title}`,
        description: `${pct}% funded — ${formatCurrency(topGoal.current ?? 0)} of ${formatCurrency(topGoal.target)}. ${pct >= 50 ? "More than halfway there — keep building momentum." : "Early days — consistent contributions will get you there."}`,
        priority: "low",
        cta: "View Goal",
      });
    }

    return list;
  }, [demo, store.propertyAssets, store.goals]);

  // ── AI response generator (uses real demo data) ─────────────────────────────
  const aiResponse = React.useCallback(
    (q: string): string => {
      const lq = q.toLowerCase();

      if (
        lq.includes("retire earlier") ||
        lq.includes("retire 2 years") ||
        lq.includes("retirement")
      ) {
        if (demo.currentInvested === 0) {
          return `To give you a personalised retirement projection, please complete your retirement profile with your current invested amount, monthly savings, and target retirement age.\n\nOnce set up, I can model the impact of extra contributions and suggest the fastest path to your retirement goals.`;
        }
        return `Based on your current portfolio of ${formatCurrency(demo.currentInvested)} and monthly contributions of ${formatCurrency(demo.monthlySavings)}, retiring at ${demo.retirementAge} is well within reach.\n\nTo retire 2 years earlier at **age ${demo.retirementAge - 2}**, you would need to increase your monthly contributions by approximately **$2,800/month** — bringing your total to ${formatCurrency(demo.monthlySavings + 2800)}/month. At a 7% annual return, that additional effort compounds to roughly **$1.13M in extra retirement capital**.\n\nAlternatively, redirecting even half of your current ${formatCurrency(demo.surplus)}/month surplus toward investments would put you in that range with minimal lifestyle adjustment.`;
      }

      if (lq.includes("increase savings") || lq.includes("$2,000")) {
        const extra = 2000;
        const yrs = demo.retirementAge - demo.currentAge;
        const futureExtra = extra * 12 * ((Math.pow(1.07, yrs) - 1) / 0.07);
        const newTotal =
          demo.currentInvested * Math.pow(1.07, yrs) + futureExtra;
        return `If you increase your monthly savings by **${formatCurrency(extra)}** starting today:\n\n• **Additional capital at retirement**: ~${formatCurrency(Math.round(futureExtra))}\n• **New projected total at ${demo.retirementAge}**: ~${formatCurrency(Math.round(newTotal))}\n• **Sustainable monthly income**: ~${formatCurrency(Math.round((newTotal * 0.04) / 12))} (4% withdrawal rate)\n\n${demo.desiredMonthlyIncome > 0 ? `Your desired monthly income in retirement is ${formatCurrency(demo.desiredMonthlyIncome)}, so this boost gives you a **${formatCurrency(Math.round((newTotal * 0.04) / 12 - demo.desiredMonthlyIncome))} monthly buffer** to reinvest or use however you like.\n\n` : ""}With a current surplus of ${formatCurrency(demo.surplus)}/month, this is fully achievable today.`;
      }

      if (lq.includes("rebalance") || lq.includes("portfolio")) {
        if (demo.portfolioValue === 0) {
          return `Add your investment holdings to unlock personalised portfolio analysis and rebalancing recommendations.`;
        }
        return `Your ${formatCurrency(demo.portfolioValue)} portfolio is broadly healthy, but a few rebalancing moves could improve it:\n\n**1. Review sector concentration** — Ensure no single sector exceeds 25–30% of your equity allocation. Rotating into diversified ETFs reduces sector-specific risk.\n\n**2. Shorten bond duration** — With rates stabilising, shifting from long-duration government bonds to short-duration corporate bonds could improve yield by 0.4–0.6% with minimal credit risk increase.\n\n**3. Refresh alternative asset valuations** — Request updated valuations for any private equity or illiquid positions before making allocation decisions.`;
      }

      if (lq.includes("insured") || lq.includes("insurance")) {
        const uninsuredProps = store.propertyAssets.filter(
          (p) => p.is_active && p.insurance.length === 0,
        );
        return `You hold **${demo.insurancePolicies} active ${demo.insurancePolicies === 1 ? "policy" : "policies"}**${demo.monthlyInsurancePremium > 0 ? ` at a combined ${formatCurrency(demo.monthlyInsurancePremium)}/month` : ""}.\n\n${uninsuredProps.length > 0 ? `**Coverage gap**: ${uninsuredProps.map((p) => p.name).join(", ")} ${uninsuredProps.length === 1 ? "has" : "have"} no insurance. A standard landlord policy runs $80–120/month per property.\n\n` : ""}${demo.monthlyIncome > 0 ? `**Disability check** — ensure your long-term disability policy covers at least 60% of your ${formatCurrency(demo.monthlyIncome)}/month income. Any uncovered gap is worth reviewing with supplemental coverage.\n\n` : ""}${demo.netWorth > 1_000_000 ? `**Umbrella policy** — with a net worth of ${formatCurrency(demo.netWorth)}, an umbrella liability policy of at least $1–2M is strongly recommended if you don't already have one.` : "Review your coverage levels regularly as your net worth grows."}`;
      }

      if (lq.includes("debt") || lq.includes("eliminate")) {
        if (demo.totalDebt === 0) {
          return `You have no recorded liabilities — great position to be in! If you have debts not yet added to your profile, add them so I can give you a payoff strategy.`;
        }
        const nonMortgageDebt = store.liabilities
          .filter((l) => l.type !== "mortgage")
          .sort((a, b) => b.interestRatePct - a.interestRatePct);
        const debtLines = nonMortgageDebt
          .slice(0, 3)
          .map(
            (l, i) =>
              `**Priority ${i + 1} — ${l.name}**: ${formatCurrency(l.balance)} at ${l.interestRatePct}% APR`,
          )
          .join("\n");
        return `Your total debt is **${formatCurrency(demo.totalDebt)}**. Using the **avalanche method** (highest interest first):\n\n${debtLines || `**${store.liabilities[0]?.name ?? "Outstanding balance"}**: ${formatCurrency(demo.totalDebt)}`}\n\n**Mortgages**: Productive leverage on appreciating assets. No acceleration needed unless rates are high.\n\n${demo.surplus > 0 ? `With your ${formatCurrency(demo.surplus)}/month surplus, you can service all debts and accelerate high-interest payoff simultaneously.` : ""}`;
      }

      if (lq.includes("tax") || lq.includes("optimis")) {
        const rate = demo.effectiveTaxRate || 28;
        const saving = Math.round(demo.monthlyIncome * 12 * (rate / 100) * 0.1);
        return `At ${rate}% effective rate on ${formatCurrency(demo.monthlyIncome)}/month income, three levers stand out:\n\n**1. Max out tax-advantaged accounts** — Pension, ISA, or 401(k)/Roth IRA contributions reduce your taxable income, saving ~**${formatCurrency(saving)}/year**.\n\n**2. Tax-loss harvesting** — Selectively realising losses in your brokerage to offset capital gains could save thousands depending on your portfolio size.\n\n**3. Trust or holding structure** — ${demo.netWorth > 500_000 ? `With ${formatCurrency(demo.netWorth)} in net worth, a trust structure could significantly reduce estate tax exposure. Worth a dedicated session with your advisor.` : "As your wealth grows, structuring assets efficiently becomes increasingly valuable."}`;
      }

      const hasData = demo.netWorth > 0 || demo.monthlyIncome > 0;
      if (!hasData) {
        return `Complete your financial profile — add your income, expenses, assets, and liabilities — and I'll give you a comprehensive, numbers-based financial analysis tailored to your situation.`;
      }
      return `Your financial profile ${demo.netWorth > 0 ? `shows a net worth of ${formatCurrency(demo.netWorth)}` : "is being built"}.\n\n${demo.monthlyIncome > 0 ? `• **Monthly income**: ${formatCurrency(demo.monthlyIncome)}\n` : ""}${demo.surplus > 0 ? `• **Monthly surplus**: ${formatCurrency(demo.surplus)}\n` : ""}${demo.currentInvested > 0 ? `• **Invested**: ${formatCurrency(demo.currentInvested)}\n` : ""}${demo.totalDebt > 0 ? `• **Total debt**: ${formatCurrency(demo.totalDebt)}\n` : ""}\nThe highest-impact actions based on your data are surfaced in the insights panel. What would you like to explore in more detail?`;
    },
    [demo, store.propertyAssets, store.liabilities],
  );

  // ── Greeting — fires once when real data is available ───────────────────────
  const greetingSet = React.useRef(false);
  React.useEffect(() => {
    if (greetingSet.current) return;
    greetingSet.current = true;
    setMessages([
      {
        id: "greeting",
        role: "ai",
        text: `Hello, ${demo.firstName}! I've analysed your complete financial picture.\n\n${demo.netWorth > 0 ? `• **Net worth**: ${formatCurrency(demo.netWorth)} — growing steadily\n` : ""}${demo.surplus > 0 ? `• **Monthly surplus**: ${formatCurrency(demo.surplus)} — strong position\n` : ""}${demo.currentInvested > 0 ? `• **Retirement**: On track for age ${demo.retirementAge} with ${formatCurrency(demo.currentInvested)} invested\n` : ""}• **Insights**: ${insights.length} personalised signals surfaced on the right\n\nAsk me anything — I'll give you numbers-based answers.`,
        timestamp: new Date(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: t, timestamp: new Date() },
    ]);
    setInput("");
    setTyping(true);
    setTimeout(
      () => {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "ai",
            text: aiResponse(t),
            timestamp: new Date(),
          },
        ]);
        setTyping(false);
      },
      1100 + Math.random() * 700,
    );
  }

  const filtered =
    activeKind === "all"
      ? insights
      : insights.filter((i) => i.kind === activeKind);

  if (!ready) return null;
  if (!auth.loggedIn) {
    router.replace("/");
    return null;
  }
  if (!canAccessFeature(sub.status, "premiumInsights")) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-sm text-center space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#1e3a5f] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold">Premium Feature</h2>
          <p className="text-sm text-muted-foreground">
            Celerey AI Insights are available on the Premium plan.
          </p>
          <button
            onClick={() => router.push("/choose-plan")}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1e3a5f] px-6 text-sm font-medium text-white"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* ── LEFT: Chat ── */}
      <div className="flex flex-1 flex-col min-w-0 border-r border-muted/40">
        {/* Header */}
        <div className="shrink-0 border-b border-muted/40 px-6 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#18163f] overflow-hidden">
            <img src="https://i.ibb.co/mCs0QnX1/Celerey-Secondary-Symbol-Light-1.png" alt="Celerey" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Celerey AI</h1>
            <p className="text-xs text-muted-foreground">
              Your personal financial intelligence
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {typing && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18163f] overflow-hidden mt-1">
                  <img src="https://i.ibb.co/mCs0QnX1/Celerey-Secondary-Symbol-Light-1.png" alt="Celerey" className="h-6 w-6 object-contain" />
                </div>
                <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="block h-2 w-2 rounded-full bg-muted-foreground/60"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Suggested prompts */}
        <div className="shrink-0 border-t border-muted/40 px-6 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Suggested
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.text}
                  onClick={() => send(s.text)}
                  disabled={typing}
                  className="inline-flex items-center gap-1.5 rounded-full border border-muted/60 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <Icon className="h-3 w-3" />
                  {s.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-muted/40 px-6 py-4">
          <div className="flex gap-3 items-center rounded-2xl border border-muted/60 bg-muted/10 px-4 py-2 focus-within:border-[#1e3a5f] transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask me anything about your finances…"
              disabled={typing}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={typing || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 disabled:opacity-40 transition-colors"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Insights panel ── */}
      <div className="hidden lg:flex w-[380px] shrink-0 flex-col overflow-hidden">
        {/* Panel header */}
        <div className="shrink-0 border-b border-muted/40 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Your Insights</h2>
              <p className="text-xs text-muted-foreground">
                {insights.length} personalised signals
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-amber-700">
                {insights.filter((i) => i.priority === "high").length} high
                priority
              </span>
            </div>
          </div>

          {/* Kind filter tabs */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {(
              [
                { key: "all", label: "All" },
                { key: "opportunity", label: "Opportunities" },
                { key: "risk", label: "Risks" },
                { key: "action", label: "Actions" },
                { key: "milestone", label: "Milestones" },
              ] as { key: InsightKind | "all"; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveKind(tab.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  activeKind === tab.key
                    ? "bg-[#1e3a5f] text-white"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Insight cards list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filtered.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
            >
              <InsightCard insight={insight} onClick={send} />
            </motion.div>
          ))}
        </div>

        {/* Quick stats footer */}
        <div className="shrink-0 border-t border-muted/40 px-5 py-4 grid grid-cols-2 gap-3">
          {[
            {
              label: "Net Worth",
              value: formatCurrency(demo.netWorth),
              color: "text-emerald-600",
            },
            {
              label: "Surplus / mo",
              value: formatCurrency(demo.surplus),
              color: "text-sky-600",
            },
            {
              label: "Invested",
              value: formatCurrency(demo.currentInvested),
              color: "text-indigo-600",
            },
            {
              label: "Total Debt",
              value: formatCurrency(demo.totalDebt),
              color: "text-rose-600",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-muted/20 px-3 py-2">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className={cn("text-sm font-bold tabular-nums", s.color)}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
