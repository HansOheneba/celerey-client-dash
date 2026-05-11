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
  Bot,
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
import { canAccessFeature, formatCurrency } from "@/lib/client-data";
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

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO = {
  firstName: "Jesse",
  netWorth: 4_250_000,
  monthlyIncome: 28_500,
  monthlyExpenses: 14_200,
  surplus: 14_300,
  retirementAge: 60,
  currentAge: 43,
  currentInvested: 1_250_000,
  monthlySavings: 14_300,
  desiredMonthlyIncome: 18_500,
  totalDebt: 820_500,
  creditCardBalance: 8_500,
  portfolioValue: 1_250_000,
  insurancePolicies: 8,
  monthlyInsurancePremium: 1_230,
  effectiveTaxRate: 28,
};

const INSIGHTS: Insight[] = [
  {
    id: "tax",
    kind: "opportunity",
    title: "Optimise Your Tax Position",
    description:
      "Restructuring through a family trust or maximising 401(k)/Roth IRA could save ~$11,400/year at your 28% effective rate.",
    priority: "high",
    cta: "Discuss with Advisor",
  },
  {
    id: "concentration",
    kind: "risk",
    title: "Technology Sector Concentration",
    description:
      "~35% of your equities are in tech (AAPL). Rotating ~$62,500 into healthcare or consumer staples ETFs would reduce sector risk.",
    priority: "medium",
    cta: "Review Portfolio",
  },
  {
    id: "credit-card",
    kind: "action",
    title: "Eliminate High-Interest Debt",
    description:
      "Chase Sapphire at $8,500 × 19.99% APR. An extra $1,500/month clears it in 6 months, saving ~$1,700 in interest.",
    priority: "high",
    cta: "Plan Payoff",
  },
  {
    id: "uninsured-prop",
    kind: "risk",
    title: "Uninsured Property in Accra",
    description:
      "Labadi Beach House ($420,000) has no insurance. A landlord policy runs ~$80–120/month and covers catastrophic loss.",
    priority: "high",
    cta: "Add Insurance",
  },
  {
    id: "retirement",
    kind: "opportunity",
    title: "Retirement Trajectory: On Track",
    description:
      "$1.25M invested + $14,300/month → projected $4.89M by age 60. Adding $2,000/month could unlock retirement at 58.",
    priority: "medium",
    cta: "Explore Scenarios",
  },
  {
    id: "vacation-home",
    kind: "milestone",
    title: "Vacation Home Fund 40% Complete",
    description:
      "$340K of $850K — 6 months ahead of schedule. On track to close by early 2029 vs. original March 2030 target.",
    priority: "low",
    cta: "View Goal",
  },
  {
    id: "emergency",
    kind: "milestone",
    title: "Emergency Fund: Goal Met",
    description:
      "$85,500 covers 6 months of expenses. Safety net fully established as of December 2025.",
    priority: "low",
  },
];

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

// ── AI response generator ─────────────────────────────────────────────────────

function aiResponse(q: string): string {
  const lq = q.toLowerCase();

  if (
    lq.includes("retire earlier") ||
    lq.includes("retire 2 years") ||
    lq.includes("retirement")
  ) {
    return `Based on your current portfolio of ${formatCurrency(DEMO.currentInvested)} and monthly contributions of ${formatCurrency(DEMO.monthlySavings)}, retiring at ${DEMO.retirementAge} is well within reach.\n\nTo retire 2 years earlier at **age 58**, you would need to increase your monthly contributions by approximately **$2,800/month** — bringing your total to ${formatCurrency(DEMO.monthlySavings + 2800)}/month. At a 7% annual return, that additional effort compounds to roughly **$1.13M in extra retirement capital**.\n\nAlternatively, redirecting even half of your current ${formatCurrency(DEMO.surplus)}/month surplus toward investments would put you in that range with minimal lifestyle adjustment.`;
  }

  if (lq.includes("increase savings") || lq.includes("$2,000")) {
    const extra = 2000;
    const months = (DEMO.retirementAge - DEMO.currentAge) * 12;
    const futureExtra = extra * months * 1.45;
    const newTotal = DEMO.currentInvested * 1.45 + futureExtra;
    return `If you increase your monthly savings by **${formatCurrency(extra)}** starting today:\n\n• **Additional capital at retirement**: ~${formatCurrency(futureExtra)}\n• **New projected total at 60**: ~${formatCurrency(newTotal)}\n• **Sustainable monthly income**: ~${formatCurrency((newTotal * 0.04) / 12)} (4% withdrawal rate)\n\nYour desired monthly income in retirement is ${formatCurrency(DEMO.desiredMonthlyIncome)}, so this boost gives you a **${formatCurrency((newTotal * 0.04) / 12 - DEMO.desiredMonthlyIncome)} monthly buffer** to reinvest or use however you like.\n\nWith a current surplus of ${formatCurrency(DEMO.surplus)}/month, this is fully achievable today.`;
  }

  if (lq.includes("rebalance") || lq.includes("portfolio")) {
    return `Your ${formatCurrency(DEMO.portfolioValue)} portfolio is broadly healthy, but two rebalancing moves would improve it:\n\n**1. Reduce tech concentration** — ~35% in technology (AAPL etc.) is above the 25% threshold for concentrated sector risk. Rotating ~${formatCurrency(DEMO.portfolioValue * 0.05)} into healthcare or consumer staples ETFs would diversify without sacrificing growth.\n\n**2. Shorten bond duration** — With rates stabilising, shifting from long-duration government bonds to short-duration corporate bonds could improve yield by 0.4–0.6% with minimal credit risk increase.\n\n**3. Refresh alternative asset valuation** — Your Private Equity Fund position hasn't been revalued since Dec 2025. Request an updated valuation before making any allocation decisions.`;
  }

  if (lq.includes("insured") || lq.includes("insurance")) {
    return `You hold **${DEMO.insurancePolicies} active policies** — life, health, home, auto, disability, umbrella, travel, and pet — at a combined ${formatCurrency(DEMO.monthlyInsurancePremium)}/month.\n\nCoverage looks comprehensive overall, but two things to flag:\n\n• **Labadi Beach House (Accra, $420K)** — no insurance at all. A standard landlord policy runs $80–120/month. This is a high-priority gap.\n\n• **Disability gap** — your long-term policy covers 60% of income. Given your ${formatCurrency(DEMO.monthlyIncome)}/month earnings, the ${formatCurrency(DEMO.monthlyIncome * 0.4)} uncovered portion is worth reviewing with supplemental coverage.\n\nEverything else — including your $2M term life and $2M Chubb umbrella — appears well-calibrated to your net worth of ${formatCurrency(DEMO.netWorth)}.`;
  }

  if (lq.includes("debt") || lq.includes("eliminate")) {
    const months = Math.ceil(DEMO.creditCardBalance / (1500 * 0.7));
    return `Your total debt is **${formatCurrency(DEMO.totalDebt)}** across 5 liabilities. Using the **avalanche method** (highest interest first):\n\n**Priority 1 — Chase Sapphire Card**: ${formatCurrency(DEMO.creditCardBalance)} at 19.99% APR. An extra $1,500/month clears it in ~${months} months and saves ~$1,700 in interest.\n\n**Priority 2 — Personal Loan**: ${formatCurrency(15000)} at 8.5%. Once the card is gone, redirect that $1,500 here.\n\n**Priority 3 — Auto Loan (BMW)**: ${formatCurrency(22000)} at 4.9%. Low urgency — minimum payments are fine.\n\n**Mortgages**: Productive leverage on appreciating assets. No acceleration needed.\n\nWith your ${formatCurrency(DEMO.surplus)}/month surplus, you can service all debts and accelerate the high-interest payoff at the same time.`;
  }

  if (lq.includes("tax") || lq.includes("optimis")) {
    const saving = Math.round(DEMO.monthlyIncome * 12 * 0.35 * 0.1);
    return `At ${DEMO.effectiveTaxRate}% effective rate on ${formatCurrency(DEMO.monthlyIncome)}/month income, three levers stand out:\n\n**1. Max out tax-advantaged accounts** — 401(k) ($23,000) + Roth IRA ($7,000) = $30,000/year of pre-tax contributions, saving ~**${formatCurrency(saving)}/year** at your 35% marginal rate.\n\n**2. Tax-loss harvesting** — Selectively realising losses in your brokerage to offset capital gains could save an estimated **$11,400/year** given your portfolio size.\n\n**3. Family trust or offshore structure** — With ${formatCurrency(DEMO.netWorth)} in net worth and properties in the USA, Australia, Ghana, South Africa, and Thailand, a trust structure could significantly reduce estate tax exposure. Worth a dedicated session with your advisor.`;
  }

  return `Your financial profile is in excellent shape:\n\n• **Net worth**: ${formatCurrency(DEMO.netWorth)} — strong and growing\n• **Monthly surplus**: ${formatCurrency(DEMO.surplus)} — top 5% of earners\n• **Retirement**: Projected ${formatCurrency(4_890_000)} by age ${DEMO.retirementAge}\n• **Diversification**: Equities, real estate (6 properties), bonds, and alternatives\n\nThe three highest-impact actions right now are:\n1. **Eliminate the Chase Sapphire balance** (19.99% APR is your most expensive money)\n2. **Max out tax-advantaged accounts** to capture the ~${formatCurrency(Math.round(DEMO.monthlyIncome * 12 * 0.35 * 0.1))} annual tax saving\n3. **Insure the Labadi Beach House** — a $420K asset with zero coverage\n\nWhat would you like to explore in more detail?`;
}

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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white mt-1">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isAI
            ? "bg-muted/50 text-foreground rounded-tl-sm"
            : "bg-[#1e3a5f] text-white rounded-tr-sm",
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

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [activeKind, setActiveKind] = React.useState<InsightKind | "all">(
    "all",
  );
  const endRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Greeting on mount
  React.useEffect(() => {
    setMessages([
      {
        id: "greeting",
        role: "ai",
        text: `Hello, ${DEMO.firstName}! I've analysed your complete financial picture.\n\n• **Net worth**: ${formatCurrency(DEMO.netWorth)} — growing steadily\n• **Monthly surplus**: ${formatCurrency(DEMO.surplus)} — very strong position\n• **Retirement**: On track for age ${DEMO.retirementAge} with ${formatCurrency(DEMO.currentInvested)} invested\n• **Top priority**: Eliminate the Chase Sapphire balance at 19.99% APR\n\nI've surfaced ${INSIGHTS.length} personalised insights on the right. Ask me anything — I'll give you numbers-based answers.`,
        timestamp: new Date(),
      },
    ]);
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
      ? INSIGHTS
      : INSIGHTS.filter((i) => i.kind === activeKind);

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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e3a5f] text-white">
            <Bot className="h-4 w-4" />
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white mt-1">
                  <Bot className="h-4 w-4" />
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
                {INSIGHTS.length} personalised signals
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-amber-700">
                {INSIGHTS.filter((i) => i.priority === "high").length} high
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
              value: formatCurrency(DEMO.netWorth),
              color: "text-emerald-600",
            },
            {
              label: "Surplus / mo",
              value: formatCurrency(DEMO.surplus),
              color: "text-sky-600",
            },
            {
              label: "Invested",
              value: formatCurrency(DEMO.currentInvested),
              color: "text-indigo-600",
            },
            {
              label: "Total Debt",
              value: formatCurrency(DEMO.totalDebt),
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
