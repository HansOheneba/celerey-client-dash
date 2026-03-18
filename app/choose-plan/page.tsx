// app/choose-plan/page.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Info, ArrowRight } from "lucide-react";

import { useClientGate } from "../../lib/useClientGate";
import {
  setSubscription,
  setTrialStartedAt,
  isOnboarded,
} from "../../lib/client-data";
import { CelereyLoader } from "../../components/login/celerey-loader";

type FeatureRow = {
  label: string;
  helper?: string;
  trial: boolean;
  premium: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const BRAND = {
  navy: "#2d1b4e",
  navy2: "#0A1533",
  ink: "#060A18",
  blue: "#2F6BFF",
  cyan: "#35C7FF",
  purple: "#A855F7",
};

function AccessPill({
  variant,
}: {
  variant: "full" | "limited" | "not-included";
}) {
  if (variant === "full") {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-900">
          Full access
        </span>
      </div>
    );
  }

  if (variant === "limited") {
    return (
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium text-slate-600">Limited</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <span className="text-sm font-medium text-slate-400">Not included</span>
    </div>
  );
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const { ready, auth, sub } = useClientGate();

  useEffect(() => {
    if (!ready) return;

    if (!auth.loggedIn) {
      router.replace("/");
      return;
    }

    // Must complete onboarding before choosing a plan
    if (!isOnboarded()) {
      router.replace("/onboarding");
      return;
    }

    if (sub.status === "trialing" || sub.status === "active") {
      router.replace("/dashboard");
      return;
    }
  }, [ready, auth, sub, router]);

  function startTrial(): void {
    setSubscription("trialing");
    setTrialStartedAt(new Date().toISOString());
    router.push("/dashboard");
  }

  function goPremiumNow(): void {
    setSubscription("active");
    router.push("/dashboard");
  }

  const rows: FeatureRow[] = useMemo(
    () => [
      {
        label: "Dashboard access",
        helper: "Explore the dashboard experience and core tracking views.",
        trial: true,
        premium: true,
      },
      {
        label: "Clarity call",
        helper:
          "A one-on-one session with a Celerey Advisor to understand your goals and set a clear path.",
        trial: true,
        premium: true,
      },
      {
        label: "Portfolio tracking and performance insights",
        helper: "Monitor allocations, performance snapshots, and key changes.",
        trial: true,
        premium: true,
      },
      {
        label: "Financial health scan and baseline score",
        helper: "Capture your starting point and your key gaps.",
        trial: true,
        premium: true,
      },
      {
        label: "Goals and roadmap builder",
        helper: "Turn goals into clear milestones and a structured plan.",
        trial: true,
        premium: true,
      },
      {
        label: "Continuous portfolio intelligence",
        helper: "Highlights risks and opportunities as your data changes.",
        trial: true,
        premium: true,
      },

      // Premium-only
      {
        label: "Two advisory sessions per year",
        helper: "Direct sessions with a certified Celerey Advisor.",
        trial: false,
        premium: true,
      },
      {
        label: "Quarterly progress reviews",
        helper: "Structured reviews with tailored recommendations.",
        trial: false,
        premium: true,
      },
      {
        label: "Monthly accountability check-ins",
        helper: "Lightweight check-ins to keep momentum and clarity.",
        trial: false,
        premium: true,
      },
      {
        label: "Priority email and WhatsApp support",
        helper: "Faster response times and guided follow ups.",
        trial: false,
        premium: true,
      },
      {
        label: "Member webinars and masterclasses",
        helper: "Learning sessions and partner benefits.",
        trial: false,
        premium: true,
      },
    ],
    [],
  );

  if (!ready) return <CelereyLoader message="Loading your plan…" />;

  const trialVariant = (r: FeatureRow): "full" | "limited" | "not-included" => {
    if (r.trial) return "limited";
    return "not-included";
  };

  const premiumVariant = (
    r: FeatureRow,
  ): "full" | "limited" | "not-included" => {
    if (r.premium) return "full";
    return "not-included";
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className={cn(
            "absolute left-1/2 top-10 -translate-x-1/2 rounded-full blur-3xl opacity-25",
            "h-104 w-104 sm:h-128 sm:w-lg md:h-144 md:w-xl",
          )}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${BRAND.cyan}, transparent 55%),
                         radial-gradient(circle at 70% 70%, ${BRAND.purple}, transparent 55%),
                         radial-gradient(circle at 40% 80%, ${BRAND.blue}, transparent 60%)`,
          }}
        />
      </div>

      {/* Header */}
      <div className="text-center">
        <p
          className="text-xs font-semibold tracking-[0.18em]"
          style={{ color: BRAND.navy }}
        >
          PLANS
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Start free, or go Premium now
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          Trial gives you limited access to explore the dashboard. Premium gives
          you full access plus advisory support, reviews, and accountability.
        </p>
      </div>

      {/* Responsive cards (mobile) + table (sm+) */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* MOBILE (base -> sm): stacked layout */}
        <div className="block sm:hidden">
          {/* Plans */}
          <div className="border-b border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900">What you get</p>
            <p className="mt-1 text-xs text-slate-500">
              Trial is 7 days. Premium is billed annually at $300.
            </p>
          </div>

          <div className="grid gap-4 p-5">
            {/* Trial card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                FREE TRIAL
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Core Trial
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-semibold text-slate-900">
                  $0
                </span>
                <span className="pb-1 text-xs text-slate-500">for 7 days</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Limited access to explore the dashboard and key tracking.
              </p>

              <button
                type="button"
                onClick={startTrial}
                className={cn(
                  "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                  "text-slate-600 font-semibold border border-slate-200 bg-white",
                  "transition-transform hover:bg-slate-50 active:translate-y-0",
                )}
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-2 text-center text-xs text-slate-500">
                7 days. No payment now.
              </p>
            </div>

            {/* Premium card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
              <div
                className="absolute inset-0 z-0 opacity-[0.14]"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${BRAND.cyan}, transparent 55%),
                               radial-gradient(circle at 70% 60%, ${BRAND.purple}, transparent 55%),
                               radial-gradient(circle at 40% 90%, ${BRAND.blue}, transparent 60%)`,
                }}
              />

              <div className="relative z-10">
                <p
                  className="text-xs font-semibold tracking-[0.18em]"
                  style={{ color: BRAND.navy }}
                >
                  FULL ACCESS
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  Core Full Access
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold text-slate-900">
                    $300
                  </span>
                  <span className="pb-1 text-xs text-slate-500">
                    USD / year
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Full access to everything in the dashboard, plus advisory and
                  structured reviews.
                </p>

                <button
                  type="button"
                  onClick={goPremiumNow}
                  className={cn(
                    "mt-4 relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                    "text-white font-semibold shadow-sm",
                    "transition-transform translate-y-px active:translate-y-1",
                  )}
                  style={{
                    background: `linear-gradient(90deg, ${BRAND.navy} 0%, ${BRAND.navy2} 60%, ${BRAND.ink} 100%)`,
                  }}
                >
                  Go Premium now
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-2 text-center text-xs text-slate-500">
                  Billed annually at $300.
                </p>
              </div>
            </div>
          </div>

          {/* Feature list: stacked rows */}
          <div className="border-t border-slate-200">
            {rows.map((r) => (
              <div key={r.label} className="border-t border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 inline-flex items-center justify-center rounded-full p-0.5 ring-1"
                    style={{
                      backgroundColor: "rgba(11,16,42,0.04)",
                      borderColor: "rgba(11,16,42,0.10)",
                    }}
                  >
                    <Info className="h-4 w-4" style={{ color: BRAND.navy }} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{r.label}</p>
                    {r.helper ? (
                      <p className="mt-1 text-sm text-slate-600">{r.helper}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">
                      TRIAL
                    </p>
                    <div className="mt-2">
                      {r.label === "Clarity call" ? (
                        <span className="text-sm font-semibold text-slate-900">
                          Included
                        </span>
                      ) : (
                        <AccessPill variant={trialVariant(r)} />
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p
                      className="text-xs font-semibold tracking-[0.12em]"
                      style={{ color: BRAND.navy }}
                    >
                      PREMIUM
                    </p>
                    <div className="mt-2">
                      {r.label === "Clarity call" ? (
                        <span className="text-sm font-semibold text-slate-900">
                          Included
                        </span>
                      ) : (
                        <AccessPill variant={premiumVariant(r)} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile footer blurb */}
          <div className="border-t border-slate-200 bg-slate-50/60 p-5">
            <p className="text-sm text-slate-600">
              Start with the trial if you want to explore. Go Premium if you
              want advisory support and structured progress reviews immediately.
            </p>
          </div>
        </div>

        {/* DESKTOP/TABLET (sm+): comparison table */}
        <div className="hidden sm:block">
          {/* Header row */}
          <div className="grid grid-cols-[1.25fr_1fr_1fr] gap-0 border-b border-slate-200">
            <div className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-slate-900">
                What you get
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Trial is 7 days. Premium is billed annually at $300.
              </p>
            </div>

            {/* Trial column */}
            <div className="border-l border-slate-200 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                FREE TRIAL
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Core Trial
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-semibold text-slate-900">
                  $0
                </span>
                <span className="pb-1 text-xs text-slate-500">for 7 days</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Limited access to explore the dashboard and key tracking.
              </p>
            </div>

            {/* Premium column */}
            <div className="relative border-l border-slate-200 p-5 sm:p-6">
              <div
                className="absolute inset-0 z-0 opacity-[0.14]"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${BRAND.cyan}, transparent 55%),
                               radial-gradient(circle at 70% 60%, ${BRAND.purple}, transparent 55%),
                               radial-gradient(circle at 40% 90%, ${BRAND.blue}, transparent 60%)`,
                }}
              />
              <div className="relative z-10">
                <p
                  className="text-xs font-semibold tracking-[0.18em]"
                  style={{ color: BRAND.navy }}
                >
                  FULL ACCESS
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-900">
                  Core Full Access
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold text-slate-900">
                    $300
                  </span>
                  <span className="pb-1 text-xs text-slate-500">
                    USD / year
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Full access to everything in the dashboard, plus advisory and
                  structured reviews.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="divide-y divide-slate-200">
            {rows.map((r) => (
              <div
                key={r.label}
                className="grid grid-cols-[1.25fr_1fr_1fr] gap-0"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 inline-flex items-center justify-center rounded-full p-0.5 ring-1"
                      style={{
                        backgroundColor: "rgba(11,16,42,0.04)",
                        borderColor: "rgba(11,16,42,0.10)",
                      }}
                    >
                      <Info className="h-4 w-4" style={{ color: BRAND.navy }} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{r.label}</p>
                      {r.helper ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {r.helper}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Trial */}
                <div className="border-l border-slate-200 p-5 sm:p-6">
                  {r.label === "Clarity call" ? (
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-900">
                        Included
                      </span>
                    </div>
                  ) : (
                    <AccessPill variant={trialVariant(r)} />
                  )}
                </div>

                {/* Premium */}
                <div className="border-l border-slate-200 p-5 sm:p-6">
                  {r.label === "Clarity call" ? (
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-900">
                        Included
                      </span>
                    </div>
                  ) : (
                    <AccessPill variant={premiumVariant(r)} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTAs */}
          <div className="grid grid-cols-[1.25fr_1fr_1fr] gap-0 border-t border-slate-200 bg-slate-50/60">
            <div className="p-5 sm:p-6">
              <p className="text-sm text-slate-600">
                Start with the trial if you want to explore. Go Premium if you
                want advisory support and structured progress reviews
                immediately.
              </p>
            </div>

            {/* Trial CTA */}
            <div className="border-l border-slate-200 p-5 sm:p-6">
              <button
                type="button"
                onClick={startTrial}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                  "text-slate-600 font-semibold border border-slate-200 bg-white",
                  "transition-transform hover:bg-slate-50 active:translate-y-0",
                )}
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-2 text-center text-xs text-slate-500">
                7 days. No payment now.
              </p>
            </div>

            {/* Premium CTA */}
            <div className="border-l border-slate-200 p-5 sm:p-6">
              <button
                type="button"
                onClick={goPremiumNow}
                className={cn(
                  "relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
                  "text-white font-semibold shadow-sm",
                  "transition-transform translate-y-px active:translate-y-1",
                )}
                style={{
                  background: `linear-gradient(90deg, ${BRAND.navy} 0%, ${BRAND.navy2} 60%, ${BRAND.ink} 100%)`,
                }}
              >
                Go Premium now
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-2 text-center text-xs text-slate-500">
                Billed annually at $300.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coaching session strip (responsive already) */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Still unsure?
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Take the $100 Financial Coaching session to get aligned, clarify
              your goals, and choose the right path.
            </p>
          </div>

          <a
            href="https://celerey.co"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3",
              "font-semibold text-white shadow-sm",
              "transition-transform hover:-translate-y-px active:translate-y-0",
            )}
            style={{
              background: `linear-gradient(90deg, ${BRAND.navy} 0%, ${BRAND.navy2} 60%, ${BRAND.ink} 100%)`,
            }}
          >
            Get coaching ($100)
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-slate-500">
        Trial shows limited access. Premium shows full access.
      </p>
    </div>
  );
}
