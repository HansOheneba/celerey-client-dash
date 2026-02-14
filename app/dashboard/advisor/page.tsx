"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ActionItemsCard } from "@/components/dashboard/advisor/action-items-card";
import { AdvisorHeader } from "@/components/dashboard/advisor/advisor-header";
import { AdvisorProfileCard } from "@/components/dashboard/advisor/advisor-profile-card";
import { NotesCard } from "@/components/dashboard/advisor/notes-card";
import { RequestDialog } from "@/components/dashboard/advisor/request-dialog";
import { RequestQueueCard } from "@/components/dashboard/advisor/request-queue-card";
import { UpcomingMeetingCard } from "@/components/dashboard/advisor/upcoming-card";
import {
  ActionItem,
  Advisor,
  Meeting,
  Note,
  RequestTopic,
  RequestUrgency,
} from "@/components/dashboard/advisor/types";

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

export default function AdvisorPage() {
  const advisor: Advisor = {
    initials: "JA",
    name: "Jude Addo",
    title: "Senior Wealth Advisor",
    credentials: ["CFP®", "CFA"],
    location: "New York, USA",
    email: "j.addo@celerey.co",
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
      dueLabel: "Due Jan 20, 2026",
      done: false,
    },
    {
      id: "a2",
      label: "Update risk profile questionnaire",
      dueLabel: "Due Jan 25, 2026",
      done: false,
    },
    {
      id: "a3",
      label: "Confirm updated IPS",
      dueLabel: "Due Jan 10, 2026",
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
  const [topic, setTopic] = React.useState<RequestTopic>("portfolio");
  const [urgency, setUrgency] = React.useState<RequestUrgency>("standard");
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
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <motion.div variants={pageEnter} initial="hidden" animate="show">
          <AdvisorHeader />
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
              <AdvisorProfileCard
                advisor={advisor}
                onRequestConversation={() => setOpen(true)}
              />
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
              <UpcomingMeetingCard meeting={upcoming} />
            </motion.div>

            {/* Action items */}
            <motion.div variants={item}>
              <ActionItemsCard
                items={items}
                completedCount={completedCount}
                onToggleItem={toggleItem}
              />
            </motion.div>

            {/* Advisor queue (creative section) */}
            <motion.div variants={item}>
              <RequestQueueCard />
            </motion.div>

            {/* Notes */}
            <motion.div variants={item}>
              <NotesCard notes={notes} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <RequestDialog
        open={open}
        onOpenChange={setOpen}
        topic={topic}
        urgency={urgency}
        message={message}
        onTopicChange={setTopic}
        onUrgencyChange={setUrgency}
        onMessageChange={setMessage}
        onSubmit={submitRequest}
      />
    </div>
  );
}
