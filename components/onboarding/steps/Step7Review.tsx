"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboardingStore";
import { submitOnboarding, TokenExpiredError } from "@/lib/onboarding/api";
import { prefetchDashboardSummary } from "@/lib/dashboard-api";
import { ReverifyOtpDialog } from "@/components/onboarding/ReverifyOtpDialog";
import type { OnboardingPayload } from "@/lib/onboarding/types";
import {
  setOnboarded,
  setUserProfile,
  type UserProfile,
} from "@/lib/client-data";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Target,
  Banknote,
  Shield,
  Sunset,
} from "lucide-react";
import { formatCurrencyAmount } from "@/lib/utils";

interface Step7ReviewProps {
  onComplete: () => void;
  onEditStep: (step: number) => void;
  onBack?: () => void;
  email: string;
}

function SectionCard({
  icon,
  title,
  summary,
  step,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  summary: string | React.ReactNode;
  step: number;
  onEdit: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {summary}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="ml-3 shrink-0 flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
      >
        Edit <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

const SETUP_MESSAGES = [
  "Preparing your dashboard",
  "Crunching your numbers",
  "Calculating your retirement projections",
  "Organizing your goals",
  "Mapping your cash flow",
  "Almost there — finalizing your setup",
];

function SetupOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % SETUP_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden animate-fade-in animate-duration-700 animate-ease-out"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(59,130,246,0.22), transparent 32%),
          radial-gradient(circle at top right, rgba(168,85,247,0.18), transparent 30%),
          radial-gradient(circle at bottom left, rgba(14,165,233,0.16), transparent 28%),
          radial-gradient(circle at bottom right, rgba(99,102,241,0.18), transparent 35%),
          linear-gradient(135deg, #f8fafc 0%, #f1f5f9 35%, #eef2ff 65%, #f8fafc 100%)
        `,
      }}
    >
      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse animate-duration-4000" />
        <div className="absolute top-1/3 -right-32 h-112 w-md rounded-full bg-violet-500/20 blur-3xl animate-pulse animate-duration-5000" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl animate-pulse animate-duration-4500" />
      </div>

      {/* Logo + halo */}
      <div className="relative flex items-center justify-center animate-fade-in animate-duration-700">
        <div
          className="absolute h-56 w-56 rounded-full blur-2xl animate-pulse animate-duration-2400"
          style={{
            background:
              "radial-gradient(circle, rgba(47,107,255,0.28), rgba(168,85,247,0.18), transparent 70%)",
          }}
        />
        <Image
          src="https://i.ibb.co/d0v22fZp/logo-Dark.png"
          alt="Celerey"
          width={110}
          height={110}
          priority
        />
      </div>

      {/* Title */}
      <h2 className="relative mt-10 text-2xl font-semibold text-slate-900 animate-fade-in-up animate-duration-700 animate-delay-200">
        Setting up your dashboard
      </h2>

      {/* Rotating message */}
      <div className="relative mt-3 h-6 overflow-hidden">
        <p
          key={messageIndex}
          className="text-sm text-slate-500 animate-fade-in-up animate-duration-500"
        >
          {SETUP_MESSAGES[messageIndex]}…
        </p>
      </div>

      {/* Indeterminate progress bar */}
      <div className="relative mt-8 h-1 w-64 overflow-hidden rounded-full bg-slate-200/70 animate-fade-in animate-duration-700 animate-delay-300">
        <div className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full bg-linear-to-r from-blue-500 via-violet-500 to-cyan-400 animate-slide-in-left animate-iteration-count-infinite animate-duration-1600 animate-ease-in-out" />
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

export function Step7Review({
  onComplete,
  onEditStep,
  onBack,
  email,
}: Step7ReviewProps) {
  const store = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reverifyOpen, setReverifyOpen] = useState(false);

  const { identity, goals, incomes, emergencyFund, retirement } = store;

  async function handleSubmit() {
    if (!identity || !emergencyFund || !retirement) {
      setSubmitError(
        "Some details are missing. Please review your steps before continuing.",
      );
      return;
    }

    const payload: OnboardingPayload = {
      identity: {
        ...identity,
        email, // injected from auth state
      },
      goals,
      incomes,
      emergencyFund,
      retirement,
    };

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await submitOnboarding(payload);

      // Kick off the dashboard summary fetch immediately so it's already
      // in-flight / ready by the time the user reaches /dashboard.
      prefetchDashboardSummary();

      // Persist the created user profile for use throughout the dashboard.
      const user = result.data.user;
      setUserProfile({
        user_id: user.user_id,
        account_mode: user.account_mode,
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        resident_country: user.resident_country,
        resident_city: user.resident_city,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        currency: user.currency,
        prefix: user.prefix,
        occupation: user.occupation,
        marital_status: user.marital_status,
        user_type: user.user_type,
        is_active: user.is_active,
      } satisfies UserProfile);

      setOnboarded();
      onComplete();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        // Open the in-place reverify dialog instead of bouncing the user home.
        setSubmitError("");
        setReverifyOpen(true);
      } else {
        setSubmitError(
          "Something went wrong. Please try again. Your progress is saved.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount_monthly), 0);
  const preferredCurrency = identity?.currency || "USD";

  return (
    <div className="space-y-10">
      {isSubmitting && <SetupOverlay />}
      {/* Header */}
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold text-slate-900 leading-tight">
          Review and finish setup
        </h1>
        <p className="mt-3 text-slate-500">
          Take a moment to check your details. You can edit anything before
          completing your setup.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <SectionCard
          icon={<User className="h-5 w-5 text-primary" />}
          title="Your profile"
          summary={
            identity
              ? `${identity.display_name ?? [identity.first_name, identity.last_name].filter(Boolean).join(" ")} · ${identity.resident_country} · ${identity.currency}`
              : "Not completed"
          }
          step={2}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Target className="h-5 w-5 text-primary" />}
          title="Your goals"
          summary={
            goals.length > 0
              ? `${goals.length} goal${goals.length > 1 ? "s" : ""} · ${goals.map((g) => g.title).join(", ")}`
              : "No goals added"
          }
          step={3}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Banknote className="h-5 w-5 text-primary" />}
          title="Your income"
          summary={
            incomes.length > 0
              ? `${incomes.length} source${incomes.length > 1 ? "s" : ""} · ${formatCurrencyAmount(totalIncome, preferredCurrency)} this month`
              : "No income added"
          }
          step={4}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Shield className="h-5 w-5 text-primary" />}
          title="Emergency fund"
          summary={
            emergencyFund != null
              ? `${formatCurrencyAmount(
                  emergencyFund.cash_balance,
                  preferredCurrency,
                )} saved`
              : "Not completed"
          }
          step={6}
          onEdit={onEditStep}
        />

        <SectionCard
          icon={<Sunset className="h-5 w-5 text-primary" />}
          title="Retirement plan"
          summary={
            retirement
              ? retirement.retirement_target_year
                ? `Target year ${retirement.retirement_target_year} · ${formatCurrencyAmount(retirement.desired_monthly_income, preferredCurrency)} per month`
                : `Target age ${retirement.retirement_age} · ${formatCurrencyAmount(retirement.desired_monthly_income, preferredCurrency)} per month`
              : "Not completed"
          }
          step={7}
          onEdit={onEditStep}
        />
      </div>

      {/* Next step box */}
      <div className="rounded-2xl border border-slate-100 bg-primary p-6 text-white">
        <p className="text-xs font-semibold tracking-widest text-white/60 uppercase mb-3">
          Next step
        </p>

        <p className="text-sm text-white/90 leading-relaxed">
          Once you complete setup, your dashboard will be ready. You will be
          able to track your finances, see your net worth, and follow a clear
          plan based on your goals.
        </p>
      </div>

      <ReverifyOtpDialog
        open={reverifyOpen}
        email={email}
        onOpenChange={setReverifyOpen}
        onVerified={() => {
          // Token cookie has been refreshed by the dialog. Retry submit.
          void handleSubmit();
        }}
      />

      {submitError && (
        <p className="text-sm text-red-600 font-medium rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          {submitError}
        </p>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 gap-1 h-12 text-base rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 gap-2 bg-primary hover:bg-[#1e1b55] text-white h-12 text-base rounded-xl disabled:opacity-70 cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          Complete setup
        </Button>
      </div>
    </div>
  );
}
