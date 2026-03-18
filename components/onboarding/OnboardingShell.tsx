"use client";

// components/onboarding/OnboardingShell.tsx
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP_LABELS: Record<number, string> = {
  1: "Welcome",
  2: "Your Goals",
  3: "Income",
  4: "Debts & Liabilities",
  5: "Emergency Fund",
  6: "Retirement",
  7: "Review",
  8: "All Done",
};

interface OnboardingShellProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  showBack: boolean;
  children: React.ReactNode;
}

export function OnboardingShell({
  currentStep,
  totalSteps,
  onBack,
  showBack,
  children,
}: OnboardingShellProps) {
  const progressPct = Math.min(
    ((currentStep - 1) / (totalSteps - 1)) * 100,
    100,
  );

  // Step 8 renders its own full-page layout
  if (currentStep === 8) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="pt-6 pb-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Image
            src="/Celerey_Logo_dark.png"
            alt="Celerey"
            width={100}
            height={100}
            priority
            className="shrink-0"
          />

          {/* Step label */}
          <div className="flex w-full items-center justify-between text-xs font-medium text-slate-500">
            <span>{STEP_LABELS[currentStep]}</span>
            <span className="tabular-nums">
              {currentStep} / {totalSteps - 1}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <main className="flex-1 flex justify-center items-center py-8 px-4 sm:px-6">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Back Button Footer ───────────────────────────────────── */}
      {showBack && (
        <footer className="sticky bottom-0 border-t border-slate-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center px-4 py-3 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-slate-500 hover:text-slate-900"
              onClick={onBack}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
