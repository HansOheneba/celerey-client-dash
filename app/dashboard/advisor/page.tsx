"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useClientGate } from "@/lib/useClientGate";
import { canAccessFeature } from "@/lib/client-data";
import { motion } from "framer-motion";
import { ActionItemsCard } from "@/components/dashboard/advisor/action-items-card";
import { AdvisorHeader } from "@/components/dashboard/advisor/advisor-header";
import { NotesCard } from "@/components/dashboard/advisor/notes-card";
import { RequestDialog } from "@/components/dashboard/advisor/request-dialog";
import { RequestQueueCard } from "@/components/dashboard/advisor/request-queue-card";
import {
  ActionItem,
  RequestTopic,
  RequestUrgency,
} from "@/components/dashboard/advisor/types";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";

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
  const [items, setItems] = React.useState<ActionItem[]>([]);
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

  if (!canAccessFeature(sub, "advisorChat")) {
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
              <DashCard>
                <CardHeader>
                  <CardTitle className="text-base">Your Advisor</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground text-2xl font-semibold">
                    ?
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Your dedicated advisor will appear here once assigned. In
                    the meantime, you can submit a request below.
                  </p>
                  <button
                    onClick={() => setOpen(true)}
                    className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm bg-[#0B102A] text-white"
                  >
                    Request a conversation
                  </button>
                </CardContent>
              </DashCard>
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
              <DashCard>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Meeting</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Scheduled sessions are created after requests are reviewed
                    and confirmed.
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No upcoming meetings scheduled.
                  </p>
                </CardContent>
              </DashCard>
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
              <NotesCard notes={[]} />
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
