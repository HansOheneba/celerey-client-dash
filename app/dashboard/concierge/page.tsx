// app/dashboard/concierge/page.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ServiceInquiryDialog,
  type ConciergeService,
} from "@/components/dashboard/services/ServiceInquiryDialog";

type ServiceCard = {
  number: string;
  title: string;
  audience: string;
  description: string;
  focusAreas: string[];
  deliverable: string;
  advisorType: string;
  serviceId: string;
};

const SERVICES: ServiceCard[] = [
  {
    number: "01",
    title: "Wealth & Portfolio Review",
    audience:
      "For clients with existing investments seeking an independent, expert second opinion.",
    description:
      "A structured session with an accredited wealth planner to review your current holdings, assess suitability against your goals and risk profile, identify gaps or concentrations, and provide clear recommendations.",
    focusAreas: [
      "Portfolio diagnostic",
      "Suitability assessment",
      "Concentration & risk analysis",
      "Reallocation recommendations",
    ],
    deliverable: "Written Advisory Opinion & Recommended Allocation",
    advisorType: "Accredited Wealth Planner",
    serviceId: "wealth-portfolio-review",
  },
  {
    number: "02",
    title: "Tax Optimisation",
    audience:
      "For individuals and business owners seeking to structure their affairs more efficiently.",
    description:
      "A dedicated session with an accredited tax advisor to review your current tax position and identify opportunities, including forward-looking structuring ahead of a liquidity event, inheritance, or business transaction.",
    focusAreas: [
      "Current tax position review",
      "Opportunity identification",
      "Pre-event structuring advice",
      "Cross-border considerations",
    ],
    deliverable: "Tax Plan & Written Advisory Opinion",
    advisorType: "Accredited Tax Advisor",
    serviceId: "tax-optimisation",
  },
  {
    number: "03",
    title: "Legacy & Estate Planning",
    audience:
      "For individuals and families thinking seriously about generational wealth and governance.",
    description:
      "A high-value engagement with an accredited wealth manager focused on the structures that protect and transfer wealth across generations, including family governance frameworks, trust structures, succession planning, and wealth transfer strategies.",
    focusAreas: [
      "Trust & family structure review",
      "Succession planning",
      "Intergenerational transfer strategy",
      "Governance framework overview",
    ],
    deliverable: "Legacy Strategy Report & Structural Recommendations",
    advisorType: "Accredited Wealth Manager",
    serviceId: "legacy-estate-planning",
  },
  {
    number: "04",
    title: "International Property Advisory",
    audience:
      "For clients acquiring, financing, or structuring real estate across jurisdictions.",
    description:
      "A specialist session with an accredited property consultant covering the full picture of an international acquisition — from ownership structures and offshore financing to yield expectations, jurisdiction-specific risks, and portfolio fit.",
    focusAreas: [
      "Acquisition structure analysis",
      "Offshore financing review",
      "Yield & valuation assessment",
      "Jurisdiction risk overview",
    ],
    deliverable: "Property Advisory Report & Structuring Guidance",
    advisorType: "Accredited Property Consultant",
    serviceId: "international-property-advisory",
  },
  {
    number: "05",
    title: "Business Financing & Capital Strategy",
    audience:
      "For founders and SME owners navigating debt, growth capital, or balance sheet restructuring.",
    description:
      "A structured advisory session with a senior financial advisor focused on capital decisions including optimal debt structures, refinancing opportunities, equity vs. debt trade-offs, and how to position your business for banks, private credit, or investors.",
    focusAreas: [
      "Capital needs assessment",
      "Debt optimisation review",
      "Equity vs. debt analysis",
      "Lender / investor positioning",
    ],
    deliverable: "Financing Plan & Capital Strategy Recommendations",
    advisorType: "Senior Financial Advisor",
    serviceId: "business-financing-capital-strategy",
  },
];

export default function ConciergePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<ConciergeService | null>(null);

  function openInquiry(service: ServiceCard) {
    const picked: ConciergeService = {
      id: service.serviceId,
      title: service.title,
      subtitle: service.audience,
    };

    setSelected(picked);
    setDialogOpen(true);
  }

  function openCustomInquiry() {
    const picked: ConciergeService = {
      id: "custom",
      title: "Custom request",
      subtitle:
        "Share the outcome you need support with and we will confirm fit, scope, and next steps.",
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
    console.log("Service inquiry submitted:", payload);
  }

  return (
    <div className="w-full">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-[22px] border border-black/10 bg-white"
        >
          {/* <div className="border-b border-black/10 px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">
              Concierge
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              Advisory services
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              Select a service to submit a request for specialist advisory
              support. Each engagement is structured around your context,
              objectives, and the written outcome you need.
            </p>
          </div> */}

          <div className="divide-y divide-black/10">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.serviceId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: idx * 0.04,
                }}
              >
                <div className="px-5 py-5 sm:px-6 sm:py-6 hover:bg-black/[0.02]">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 max-w-4xl">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#1a1856]/6 px-2 text-xs font-semibold text-[#1a1856] ring-1 ring-[#1a1856]/10">
                            {service.number}
                          </span>
                          <p className="text-lg font-semibold tracking-tight text-neutral-900">
                            {service.title}
                          </p>
                        </div>

                        <p className="mt-3 text-sm font-medium text-neutral-800">
                          {service.audience}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                          {service.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-start justify-end">
                        <Button
                          type="button"
                          className="h-10 rounded-full bg-[#1a1856] px-4 text-white hover:bg-[#1a1856]/90"
                          onClick={() => openInquiry(service)}
                        >
                          Request service
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          Focus areas
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {service.focusAreas.map((item) => (
                            <div
                              key={item}
                              className="flex items-start gap-2 text-sm leading-6 text-neutral-700"
                            >
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#b07d3d]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            Deliverable
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-800">
                            {service.deliverable}
                          </p>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            Advisor
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-800">
                            {service.advisorType}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-black/15 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold text-neutral-900">
                    Custom request
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    For needs that do not fit neatly into one category, share
                    the outcome you are working toward and we will confirm the
                    right advisory path.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-black/10 px-4 text-[#1a1856] hover:bg-[#1a1856]/5"
                  onClick={openCustomInquiry}
                >
                  Create request
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
          className="h-fit rounded-[22px] border border-black/10 bg-white p-5 sm:p-6"
        >
          <p className="text-sm font-semibold text-neutral-900">How it works</p>

          <div className="mt-4 space-y-4">
            {[
              {
                n: "1",
                t: "Choose a service",
                d: "Select the advisory service that best matches the decision, structure, or review you need.",
              },
              {
                n: "2",
                t: "Share your context",
                d: "Add your timeline, goals, and any relevant background so we can assess fit properly.",
              },
              {
                n: "3",
                t: "Confirm scope",
                d: "We review the request, confirm the right specialist, and outline next steps before work begins.",
              },
            ].map((item) => (
              <div key={item.n} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b07d3d]/10 text-[11px] font-semibold text-[#b07d3d] ring-1 ring-[#b07d3d]/25">
                  {item.n}
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.t}
                  </p>
                  <p className="mt-0.5 text-sm leading-6 text-neutral-600">
                    {item.d}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 bg-neutral-50 p-4">
            <p className="text-xs tracking-[0.2em] text-neutral-500">
              WHAT YOU RECEIVE
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Each service is designed to lead to a written advisory outcome,
              such as an opinion, plan, report, allocation recommendation, or
              structural guidance.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-black/10 bg-neutral-50 p-4">
            <p className="text-xs tracking-[0.2em] text-neutral-500">
              RESPONSE NOTE
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              After a request is submitted, we send a confirmatory email and may
              request further context before confirming scope.
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
