"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useClientGate } from "@/lib/useClientGate";
import { canAccessFeature } from "@/lib/entitlements";
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
  const router = useRouter();
  const { ready, auth, sub } = useClientGate();

  // ✅ All hooks before any early returns
  const [items, setItems] = React.useState<ActionItem[]>(
    advisorData.actionItems,
  );
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
    console.log("REQUEST", { topic, urgency, message });
    setOpen(false);
    setMessage("");
    setUrgency("standard");
    setTopic("portfolio");
  }

  // ✅ Early returns after all hooks
  if (!ready) return <div>Loading...</div>;

  if (!auth.loggedIn) {
    router.replace("/");
    return <div />;
  }

  if (!canAccessFeature(sub.status, "advisorChat")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <h2 className="text-xl font-semibold">Feature locked</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Advisor access is available for Premium members only.
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                try {
                  window.localStorage.setItem("upgrade_intent", "true");
                } catch {}
                router.push("/choose-plan");
              }}
              className="inline-flex h-10 items-center justify-center rounded-md px-4 bg-[#0B102A] text-white"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  const advisor = advisorData.advisor;
  const upcoming = advisorData.upcomingMeeting;
  const notes = advisorData.notes;

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

            {/* Advisor queue */}
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
