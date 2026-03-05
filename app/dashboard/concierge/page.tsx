// app/dashboard/concierge/page.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ServiceInquiryDialog,
  type ConciergeService,
} from "@/components/dashboard/services/ServiceInquiryDialog";

type ServiceCard = {
  title: string;
  description: string;
  serviceId: string;
};

const SERVICES: ServiceCard[] = [
  {
    title: "Tax planning",
    description:
      "Clarifying exposure and organising a plan for the next filing cycle.",
    serviceId: "tax",
  },
  {
    title: "Debt management",
    description:
      "Reducing costly interest and building a payoff plan that improves monthly flexibility.",
    serviceId: "debt",
  },
  {
    title: "Budget and spending plan",
    description:
      "Creating a simple monthly plan that is staying easy to follow and adjust.",
    serviceId: "budget",
  },
  {
    title: "Savings and emergency fund",
    description:
      "Building a resilient buffer and a routine that is sticking over time.",
    serviceId: "savings",
  },
  {
    title: "Investing setup",
    description:
      "Setting up a sensible approach that is matching your timeline and risk comfort.",
    serviceId: "investing",
  },
  {
    title: "Property decision support",
    description:
      "Evaluating a property decision with numbers that are keeping the decision grounded.",
    serviceId: "property",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ConciergePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ConciergeService | null>(null);

  function openInquiry(s: ServiceCard) {
    const picked: ConciergeService = {
      id: s.serviceId,
      title: s.title,
      subtitle: s.description,
    };
    setSelected(picked);
    setDialogOpen(true);
  }

  function openCustomInquiry() {
    const picked: ConciergeService = {
      id: "custom",
      title: "Custom request",
      subtitle:
        "Sharing the outcome you want solved so we are confirming fit and proposing scope.",
    };
    setSelected(picked);
    setDialogOpen(true);
  }

  async function handleSubmit(payload: {
    service: ConciergeService;
    fullName: string;
    email: string;
    phone: string;
    preferredContact: "WhatsApp" | "Email" | "Phone call";
    timeframe: "ASAP" | "This week" | "This month" | "Flexible";
    country: string;
    goal: string;
    context: string;
    custom?: { topic: string };
  }) {
    // Replace this with your API call / server action.
    // Example: await fetch("/api/concierge/inquiry", { method:"POST", body: JSON.stringify(payload) })
    console.log("Service inquiry submitted:", payload);
  }

  return (
    <div className="w-full">
   

      {/* Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Services list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-[22px] border border-black/10 bg-white"
        >
          <div className="border-b border-black/10 px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-neutral-900">
              Available services
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-600">
              Choose one to open a short request form.
            </p>
          </div>

          <div className="divide-y divide-black/10">
            {SERVICES.map((s, idx) => (
              <motion.div
                key={s.serviceId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: idx * 0.03,
                }}
              >
                <div className="group px-5 py-4 sm:px-6 sm:py-5 hover:bg-black/[0.02]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">
                        {s.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">
                        {s.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 rounded-full px-4 text-[#1a1856] hover:bg-[#1a1856]/5"
                        onClick={() => openInquiry(s)}
                      >
                        Request
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Custom */}
            <div className="px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">
                    Custom request
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Sharing a specific outcome is helping us confirm fit and
                    define scope.
                  </p>
                </div>

                <Button
                  type="button"
                  className="h-9 rounded-full bg-[#1a1856] px-4 text-white hover:bg-[#1a1856]/90"
                  onClick={openCustomInquiry}
                >
                  Create request
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Side panel (dashboard style) */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          className="h-fit rounded-[22px] border border-black/10 bg-white p-5 sm:p-6"
        >
          <p className="text-sm font-semibold text-neutral-900">How it works</p>

          <div className="mt-4 space-y-3">
            {[
              {
                n: "1",
                t: "Choosing a service",
                d: "Pick an option this will open a short request form.",
              },
              {
                n: "2",
                t: "Share context",
                d: "Add timelines and notes so we can match you with the right support.",
              },
              {
                n: "3",
                t: "Confirm scope",
                d: "We are confirm fit and next steps before work starts.",
              },
            ].map((x) => (
              <div key={x.n} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b07d3d]/10 text-[11px] font-semibold text-[#b07d3d] ring-1 ring-[#b07d3d]/25">
                  {x.n}
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{x.t}</p>
                  <p className="mt-0.5 text-sm leading-6 text-neutral-600">
                    {x.d}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-black/10 bg-neutral-50 p-4">
            <p className="text-xs tracking-[0.2em] text-neutral-500">
              RESPONSE NOTE
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              After a request is submitted, we send a confirmatory email and request any further context if needed.
            </p>
          </div>
        </motion.aside>
      </div>

      <ServiceInquiryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selected}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
