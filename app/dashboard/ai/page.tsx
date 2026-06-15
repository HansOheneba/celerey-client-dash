"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Send,
  User,
  BarChart2,
  Target,
  Shield,
  PiggyBank,
  Lightbulb,
  ChevronRight,
  Plus,
  Copy,
  Check,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientGate } from "@/lib/useClientGate";
import {
  formatCurrency,
} from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { useSearchParams } from "next/navigation";
import {
  buildFinancialSnapshot,
  buildGreeting,
  buildSuggestedPrompts,
  generateLocalAiResponse,
} from "@/lib/celerey-ai-local";

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

const SUGGESTED_ICONS = [Target, TrendingUp, BarChart2, Shield, PiggyBank, Lightbulb];

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
    <div className="rounded-xl border border-muted/60 bg-background p-4 hover:border-muted transition-colors">
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
              onClick={() => onClick(`${insight.title}. ${insight.description}`)}
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
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    const plain = msg.text.replace(/\*\*([^*]+)\*\*/g, "$1");
    navigator.clipboard.writeText(plain).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("group flex gap-3", isAI ? "justify-start" : "justify-end")}
    >
      {isAI && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#18163f] overflow-hidden">
          <img
            src="https://i.ibb.co/mCs0QnX1/Celerey-Secondary-Symbol-Light-1.png"
            alt="Celerey"
            className="h-5 w-5 object-contain"
          />
        </div>
      )}
      <div
        className={cn(
          "flex max-w-[85%] flex-col",
          isAI ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isAI
              ? "bg-muted/40 text-foreground rounded-tl-sm"
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
        {isAI && (
          <button
            onClick={copy}
            className="mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-opacity hover:bg-muted/40 hover:text-foreground group-hover:opacity-100"
            aria-label="Copy message"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </button>
        )}
      </div>
      {!isAI && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIInsightsPage() {
  const searchParams = useSearchParams();
  const { ready, auth } = useClientGate();
  const store = useFinancialStore();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [activeKind, setActiveKind] = React.useState<InsightKind | "all">(
    "all",
  );
  const endRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = React.useRef<number | null>(null);

  const snapshot = React.useMemo(
    () =>
      buildFinancialSnapshot({
        user: store.user,
        incomeRows: store.incomeRows,
        expenseCategories: store.expenseCategories,
        goals: store.goals,
        retirement: store.retirement,
        liabilities: store.liabilities,
        emergencyFund: store.emergencyFund,
        holdings: store.holdings,
        insurancePolicies: store.insurancePolicies,
        propertyAssets: store.propertyAssets,
        taxProfile: store.taxProfile,
        profileCompletionScore: store.profileCompletionScore,
      }),
    [
      store.user,
      store.incomeRows,
      store.expenseCategories,
      store.goals,
      store.retirement,
      store.liabilities,
      store.emergencyFund,
      store.holdings,
      store.insurancePolicies,
      store.propertyAssets,
      store.taxProfile,
      store.profileCompletionScore,
    ],
  );

  const suggestedPrompts = React.useMemo(
    () => buildSuggestedPrompts(snapshot),
    [snapshot],
  );

  // ── Dynamic insights from store ─────────────────────────────────────────────
  const insights = React.useMemo((): Insight[] => {
    const list: Insight[] = [];

    // Tax opportunity
    list.push({
      id: "tax",
      kind: "opportunity",
      title: "Optimise Your Tax Position",
      description:
        snapshot.effectiveTaxRate > 0
          ? `At ${snapshot.effectiveTaxRate}% effective rate, tax-advantaged contributions and loss harvesting could save meaningful tax each year.`
          : "Maximising tax-advantaged accounts and reviewing your structure can reduce annual tax liability.",
      priority: "high",
      cta: "Discuss with Advisor",
    });

    // High-interest debt action
    if (snapshot.creditCardBalance > 0) {
      const interestSaved = Math.round(
        (snapshot.creditCardBalance * snapshot.creditCardRate) / 100 / 2,
      );
      list.push({
        id: "credit-card",
        kind: "action",
        title: "Eliminate High-Interest Debt",
        description: `${formatCurrency(snapshot.creditCardBalance)} at ${snapshot.creditCardRate}% APR. Aggressive payoff saves ~${formatCurrency(interestSaved)} in interest.`,
        priority: "high",
        cta: "Plan Payoff",
      });
    } else if (snapshot.totalDebt > 0) {
      list.push({
        id: "debt",
        kind: "action",
        title: "Review Your Debt Position",
        description: `You have ${formatCurrency(snapshot.totalDebt)} in outstanding liabilities. Prioritise high-interest balances first.`,
        priority: "medium",
        cta: "Plan Payoff",
      });
    }

    // Uninsured properties
    const uninsured = snapshot.uninsuredProperties;
    if (uninsured.length > 0) {
      const first = uninsured[0];
      list.push({
        id: "uninsured-prop",
        kind: "risk",
        title: `Uninsured Property${uninsured.length > 1 ? ` (${uninsured.length})` : ""}`,
        description:
          uninsured.length === 1
            ? `${first.name} (${formatCurrency(first.market_value)}) has no insurance. A landlord policy runs ~$80-120/month and covers catastrophic loss.`
            : `${uninsured.length} properties including ${first.name} have no insurance coverage. This is a significant risk exposure.`,
        priority: "high",
        cta: "Add Insurance",
      });
    }

    // Portfolio / concentration risk
    if (snapshot.portfolioValue > 0) {
      list.push({
        id: "portfolio",
        kind: "risk",
        title: "Review Portfolio Allocation",
        description: `Your ${formatCurrency(snapshot.portfolioValue)} portfolio should stay diversified. ${snapshot.largestHolding ? `Largest holding: ${snapshot.largestHolding.name}.` : ""} Rebalance when any position drifts 5%+ from target.`,
        priority: "medium",
        cta: "Review Portfolio",
      });
    }

    // Retirement trajectory
    if (
      snapshot.currentInvested > 0 &&
      snapshot.retirementAge > 0 &&
      snapshot.currentAge > 0
    ) {
      list.push({
        id: "retirement",
        kind: "opportunity",
        title: `Retirement Trajectory: ${snapshot.retirementOnTrack ? "On Track" : "Needs Attention"}`,
        description: `${formatCurrency(snapshot.currentInvested)} invested + ${formatCurrency(snapshot.monthlySavings)}/month projects ~${formatCurrency(Math.round(snapshot.projectedRetirement))} by age ${snapshot.retirementAge}. ${snapshot.retirementOnTrack ? "Consider extra contributions to retire earlier." : "Increase savings to hit your income target."}`,
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
    const topGoal = snapshot.topGoal;
    if (topGoal) {
      const pct = Math.round(((topGoal.current ?? 0) / topGoal.target) * 100);
      list.push({
        id: `goal-${topGoal.id}`,
        kind: pct >= 100 ? "milestone" : "opportunity",
        title: `Goal: ${topGoal.title}`,
        description: `${pct}% funded - ${formatCurrency(topGoal.current ?? 0)} of ${formatCurrency(topGoal.target)}. ${pct >= 50 ? "More than halfway there - keep building momentum." : "Early days - consistent contributions will get you there."}`,
        priority: "low",
        cta: "View Goal",
      });
    }

    return list;
  }, [snapshot]);

  const respond = React.useCallback(
    (q: string) => generateLocalAiResponse(q, snapshot),
    [snapshot],
  );

  const greetingSet = React.useRef(false);
  const promptAutoSent = React.useRef(false);

  React.useEffect(() => {
    if (greetingSet.current) return;
    greetingSet.current = true;
    setMessages([
      {
        id: "greeting",
        role: "ai",
        text: buildGreeting(snapshot),
        timestamp: new Date(),
      },
    ]);
  }, [snapshot]);

  React.useEffect(() => {
    if (!ready || !auth.loggedIn || promptAutoSent.current) return;
    const urlPrompt = searchParams.get("prompt")?.trim();
    if (!urlPrompt) return;
    promptAutoSent.current = true;
    const timer = window.setTimeout(() => send(urlPrompt), 450);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, auth.loggedIn, searchParams]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const t = text.trim();
    if (!t || typing) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: t, timestamp: new Date() },
    ]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setTyping(true);
    typingTimeoutRef.current = window.setTimeout(
      () => {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "ai",
            text: respond(t),
            timestamp: new Date(),
          },
        ]);
        setTyping(false);
        typingTimeoutRef.current = null;
      },
      1100 + Math.random() * 700,
    );
  }

  function stopGenerating() {
    if (typingTimeoutRef.current != null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTyping(false);
  }

  function newChat() {
    if (typingTimeoutRef.current != null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTyping(false);
    greetingSet.current = false;
    setMessages([]);
    // Re-trigger the greeting effect on next render
    requestAnimationFrame(() => {
      greetingSet.current = true;
      setMessages([
        {
          id: "greeting",
          role: "ai",
          text: buildGreeting(snapshot),
          timestamp: new Date(),
        },
      ]);
    });
  }

  function handleTextareaInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    setInput(el.value);
  }

  const filtered =
    activeKind === "all"
      ? insights
      : insights.filter((i) => i.kind === activeKind);

  if (!ready || !auth.loggedIn) return null;

  const isEmptyState = messages.length <= 1 && messages[0]?.id === "greeting";

  const quickStats = [
    {
      label: "Net Worth",
      value: formatCurrency(snapshot.netWorth),
      color: "text-emerald-600",
    },
    {
      label: "Surplus / mo",
      value: formatCurrency(snapshot.surplus),
      color: "text-sky-600",
    },
    {
      label: "Invested",
      value: formatCurrency(snapshot.currentInvested),
      color: "text-indigo-600",
    },
    {
      label: "Total Debt",
      value: formatCurrency(snapshot.totalDebt),
      color: "text-rose-600",
    },
  ];

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)] flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#18163f]">
          <img
            src="https://i.ibb.co/mCs0QnX1/Celerey-Secondary-Symbol-Light-1.png"
            alt="Celerey"
            className="h-5 w-5 object-contain"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold leading-tight">Celerey AI</h1>
          <p className="text-[11px] text-muted-foreground">
            Personal financial intelligence
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!isEmptyState && (
            <button
              onClick={newChat}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              New chat
            </button>
          )}
          <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </div>

      {/* Messages / Empty hero */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {isEmptyState ? (
            <div className="space-y-8">
              <MessageBubble msg={messages[0]} />

              {/* Snapshot tiles */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your snapshot
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {quickStats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {s.label}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          s.color,
                        )}
                      >
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested prompt grid */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Try asking
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((text, idx) => {
                    const Icon = SUGGESTED_ICONS[idx] ?? Lightbulb;
                    return (
                      <button
                        key={text}
                        onClick={() => send(text)}
                        disabled={typing}
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-[#1e3a5f]/40 hover:bg-muted/30 disabled:opacity-40"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground transition-colors group-hover:bg-[#1e3a5f] group-hover:text-white">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="flex-1 truncate">{text}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top insights */}
              {insights.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Top insights for you
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(
                        [
                          { key: "all", label: "All" },
                          { key: "opportunity", label: "Opportunities" },
                          { key: "risk", label: "Risks" },
                          { key: "action", label: "Actions" },
                          { key: "milestone", label: "Milestones" },
                        ] as {
                          key: InsightKind | "all";
                          label: string;
                        }[]
                      ).map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveKind(tab.key)}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors",
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
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {filtered.slice(0, 4).map((insight, idx) => (
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
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
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
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#18163f]">
                      <img
                        src="https://i.ibb.co/mCs0QnX1/Celerey-Secondary-Symbol-Light-1.png"
                        alt="Celerey"
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted/40 px-4 py-3">
                      <div className="flex h-5 items-center gap-1">
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
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border/60 bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2 shadow-sm transition-colors focus-within:border-[#1e3a5f]/60" data-tour="primary-action">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleTextareaInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything about your finances..."
              disabled={typing}
              className="max-h-50 flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            {typing ? (
              <button
                onClick={stopGenerating}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/70"
                aria-label="Stop generating"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white transition-colors hover:bg-[#1e3a5f]/90 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Celerey AI uses your live financial data. Verify important figures
            with your advisor.
          </p>
        </div>
      </div>
    </div>
  );
}
