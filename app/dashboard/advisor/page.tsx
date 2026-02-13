"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  GraduationCap,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  CheckCircle2,
  Circle,
  FileText,
  MessageSquareText,
  ClipboardList,
  Clock3,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Availability = "available" | "limited" | "away";

type Advisor = {
  initials: string;
  name: string;
  title: string;
  credentials: string[];
  location: string;
  email: string;
  phone: string;
  availability: Availability;
  bio: string;
  specialties: string[];
  philosophy: string;
};

type Meeting = {
  title: string;
  dateLabel: string; // keep as display string for now
  type: "review" | "checkin";
  status: "scheduled" | "requested";
};

type ActionItem = {
  id: string;
  label: string;
  dueLabel: string;
  done: boolean;
};

type Note = {
  id: string;
  dateLabel: string;
  text: string;
};

const pageEnter = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const list = {
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

function AvailabilityPill({ value }: { value: Availability }) {
  const meta =
    value === "available"
      ? {
          label: "Available for requests",
          dot: "bg-emerald-500",
          bg: "bg-emerald-50/60",
          br: "border-emerald-200/60",
          tx: "text-emerald-800",
        }
      : value === "limited"
        ? {
            label: "Limited availability",
            dot: "bg-amber-500",
            bg: "bg-amber-50/60",
            br: "border-amber-200/60",
            tx: "text-amber-800",
          }
        : {
            label: "Away",
            dot: "bg-neutral-400",
            bg: "bg-muted/30",
            br: "border-muted/60",
            tx: "text-muted-foreground",
          };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        meta.bg,
        meta.br,
        meta.tx,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

function SoftKpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function TimelineRow({
  title,
  description,
  right,
  tone = "neutral",
  icon,
}: {
  title: string;
  description: string;
  right: React.ReactNode;
  tone?: "good" | "neutral";
  icon: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-2xl border p-4",
        "border-muted/60 bg-background/60 shadow-sm",
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
            tone === "good"
              ? "border-emerald-200/60 bg-emerald-50/60"
              : "border-muted/60 bg-muted/30",
          )}
          aria-hidden
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {description}
          </div>
        </div>
      </div>

      <div className="shrink-0">{right}</div>
    </div>
  );
}

export default function AdvisorPage() {
  const advisor: Advisor = {
    initials: "JM",
    name: "James Mitchell",
    title: "Senior Wealth Advisor",
    credentials: ["CFP®", "CFA"],
    location: "New York, USA",
    email: "j.mitchell@firm.com",
    phone: "+1 (555) 012-9090",
    availability: "limited",
    bio: "James supports high-net-worth families with long-term portfolio strategy, tax-aware planning, and risk management. His style is structured and calm — focusing on clear decisions, measurable outcomes, and fewer surprises.",
    specialties: [
      "Tax-aware investing",
      "Retirement & longevity planning",
      "Trust & estate coordination",
      "Concentrated equity mitigation",
    ],
    philosophy:
      "Build a portfolio you can stick with. We aim for durable plans: resilient in drawdowns, sensible in good years, and aligned with the life you want.",
  };

  const upcoming: Meeting = {
    title: "Quarterly Review",
    dateLabel: "Jan 18, 2024 at 10:00 AM",
    type: "review",
    status: "scheduled",
  };

  const [items, setItems] = React.useState<ActionItem[]>([
    {
      id: "a1",
      label: "Review trust structure proposal",
      dueLabel: "Due Jan 20, 2024",
      done: false,
    },
    {
      id: "a2",
      label: "Update risk profile questionnaire",
      dueLabel: "Due Jan 25, 2024",
      done: false,
    },
    {
      id: "a3",
      label: "Confirm updated IPS",
      dueLabel: "Due Jan 10, 2024",
      done: true,
    },
  ]);

  const notes: Note[] = [
    {
      id: "n1",
      dateLabel: "Jan 5, 2024",
      text: "Discussed tax optimization strategies. Alexandra to review trust structure documentation.",
    },
    {
      id: "n2",
      dateLabel: "Dec 15, 2023",
      text: "Annual review completed. All goals on track. Adjusted retirement projections based on salary increase.",
    },
  ];

  // Request conversation dialog (logic placeholder)
  const [open, setOpen] = React.useState(false);
  const [topic, setTopic] = React.useState<
    "portfolio" | "tax" | "goals" | "other"
  >("portfolio");
  const [urgency, setUrgency] = React.useState<"standard" | "urgent">(
    "standard",
  );
  const [message, setMessage] = React.useState("");

  const completedCount = items.filter((x) => x.done).length;

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
    );
  }

  function submitRequest() {
    // Replace with your real flow:
    // - create request record in DB (status="pending")
    // - notify advisor (email/queue)
    // - show "request received" state + SLA copy
    console.log("REQUEST", { topic, urgency, message });
    setOpen(false);
    setMessage("");
    setUrgency("standard");
    setTopic("portfolio");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <motion.div
          variants={pageEnter}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          <h1 className="text-2xl font-semibold tracking-tight">
            Your Advisor
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect through structured requests — your advisor responds based on
            priority and availability.
          </p>
        </motion.div>

        {/* Layout */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left: Advisor profile */}
          <motion.div
            variants={list}
            initial="hidden"
            animate="show"
            className="lg:col-span-4 space-y-4"
          >
            <motion.div variants={item}>
              <Card className="border-muted/60 bg-background/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                      {advisor.initials}
                    </div>

                    <div className="mt-4 text-lg font-semibold tracking-tight">
                      {advisor.name}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {advisor.title}
                    </div>

                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {advisor.credentials.map((c) => (
                        <Badge key={c} variant="secondary">
                          {c}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4">
                      <AvailabilityPill value={advisor.availability} />
                    </div>

                    <Separator className="my-5" />

                    <div className="w-full space-y-3 text-left">
                      <div className="text-sm font-semibold tracking-tight">
                        Advisor bio
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {advisor.bio}
                      </p>

                      <div className="mt-4 text-sm font-semibold tracking-tight">
                        Specialties
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {advisor.specialties.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="bg-background/60"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 rounded-2xl border border-muted/60 bg-muted/20 p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="h-4 w-4" />
                          Approach
                        </div>
                        <div className="mt-2 text-sm text-foreground">
                          {advisor.philosophy}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <SoftKpi
                          icon={<MapPin className="h-4 w-4" />}
                          label="Based in"
                          value={advisor.location}
                        />
                        <SoftKpi
                          icon={<Mail className="h-4 w-4" />}
                          label="Secure email"
                          value={advisor.email}
                        />
                        <SoftKpi
                          icon={<Phone className="h-4 w-4" />}
                          label="Office line"
                          value={advisor.phone}
                        />
                      </div>

                      <div className="mt-5 space-y-2">
                        <Button
                          onClick={() => setOpen(true)}
                          className="w-full rounded-2xl bg-foreground text-background hover:bg-foreground/90 gap-2"
                        >
                          <MessageSquareText className="h-4 w-4" />
                          Request a conversation
                        </Button>

                        <Button
                          variant="secondary"
                          className="w-full rounded-2xl gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View engagement summary
                        </Button>

                        <p className="text-xs text-muted-foreground">
                          Requests are triaged. Standard requests typically
                          receive a response within 1–2 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right column */}
          <motion.div
            variants={list}
            initial="hidden"
            animate="show"
            className="lg:col-span-8 space-y-4"
          >
            {/* Upcoming */}
            <motion.div variants={item}>
              <Card className="border-muted/60 bg-background/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Meeting</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Scheduled sessions are created after requests are reviewed
                    and confirmed.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <TimelineRow
                    title={upcoming.title}
                    description={upcoming.dateLabel}
                    tone="good"
                    icon={
                      <CalendarClock className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
                    }
                    right={
                      <Badge variant="secondary" className="rounded-full">
                        Confirmed
                      </Badge>
                    }
                  />

                  <div className="rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
                    Joining links are shared once the meeting window is
                    confirmed (typically 24 hours before the session).
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action items */}
            <motion.div variants={item}>
              <Card className="border-muted/60 bg-background/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base">Action Items</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        These help your advisor move faster when reviewing
                        decisions.
                      </p>
                    </div>

                    <Badge variant="secondary" className="tabular-nums">
                      {completedCount}/{items.length} complete
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {items.map((x) => (
                    <div
                      key={x.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-muted/60 bg-background/60 p-4"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(x.id)}
                        className="flex items-center gap-3 text-left"
                        aria-label={
                          x.done ? "Mark as not done" : "Mark as done"
                        }
                      >
                        {x.done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}

                        <div className="min-w-0">
                          <div
                            className={cn(
                              "text-sm font-medium",
                              x.done
                                ? "line-through text-muted-foreground"
                                : "",
                            )}
                          >
                            {x.label}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {x.dueLabel}
                          </div>
                        </div>
                      </button>

                      <Badge variant="outline" className="bg-background/60">
                        <ClipboardList className="mr-2 h-3.5 w-3.5" />
                        client
                      </Badge>
                    </div>
                  ))}

                  <div className="rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
                    Keep these updated — they become inputs to your next review.
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Advisor queue (creative section) */}
            <motion.div variants={item}>
              <Card className="border-muted/60 bg-background/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Request Queue &amp; Service Levels
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Advisors prioritize based on complexity, urgency, and
                    compliance needs.
                  </p>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      Standard requests
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      1–2 business days
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Portfolio questions, goal updates, planning
                      clarifications.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Compliance-sensitive
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      2–4 business days
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Policy changes, IPS updates, major allocation shifts.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      Complex planning
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      3–7 business days
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Trust structures, tax planning, multi-entity strategy.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div variants={item}>
              <Card className="border-muted/60 bg-background/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Recent Notes</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Summaries from prior sessions and advisor follow-ups.
                  </p>
                </CardHeader>

                <CardContent className="space-y-3">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-2xl border border-muted/60 bg-background/60 p-4"
                    >
                      <div className="text-xs text-muted-foreground">
                        {n.dateLabel}
                      </div>
                      <div className="mt-2 text-sm text-foreground">
                        {n.text}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Request dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-muted/60 bg-background/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Request a conversation</DialogTitle>
            <DialogDescription>
              This sends a structured request to your advisor. You’ll receive a
              response and proposed time windows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Topic</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["portfolio", "Portfolio"],
                      ["tax", "Tax / Planning"],
                      ["goals", "Goals"],
                      ["other", "Other"],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setTopic(k)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                        topic === k
                          ? "border-foreground/20 bg-foreground text-background"
                          : "border-muted/60 bg-background/60 hover:bg-muted/30",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Urgency</div>
                <div className="mt-2 flex gap-2">
                  {(
                    [
                      ["standard", "Standard"],
                      ["urgent", "Urgent"],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setUrgency(k)}
                      className={cn(
                        "flex-1 rounded-full border px-3 py-1 text-xs font-medium transition",
                        urgency === k
                          ? "border-foreground/20 bg-foreground text-background"
                          : "border-muted/60 bg-background/60 hover:bg-muted/30",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Use urgent for time-sensitive decisions only.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-muted/60 bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">Message</div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you want to discuss, and include any context or constraints."
                className="mt-2 min-h-[120px] bg-background/60"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Tip: include “what decision you’re trying to make” and “by
                when”.
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitRequest}
              disabled={message.trim().length < 10}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
