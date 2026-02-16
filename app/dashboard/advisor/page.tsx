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
import { advisorData } from "@/lib/client-data";

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
  const advisor = advisorData.advisor;
  const upcoming = advisorData.upcomingMeeting;

  const [items, setItems] = React.useState<ActionItem[]>(
    advisorData.actionItems,
  );
  const notes = advisorData.notes;

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
