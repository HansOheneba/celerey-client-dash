"use client";

// components/onboarding/OnboardingShell.tsx
import React, { useEffect, useState } from "react";
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

/* ─── Premium Splash Loader ───────────────────────────────────── */
function OnboardingSplash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 1100);
    const t3 = setTimeout(() => onDone(), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(circle at 30% 30%, rgba(47,107,255,0.12), transparent 55%),
          radial-gradient(circle at 70% 70%, rgba(168,85,247,0.12), transparent 55%),
          #ffffff
        `,
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes logoEnter {
          0% { transform: scale(0.85); opacity: 0; filter: blur(6px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }

        @keyframes logoPulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.04); }
          100% { transform: scale(1); }
        }

        @keyframes glowPulse {
          0%   { opacity: 0.4; transform: scale(0.9); }
          50%  { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(0.9); }
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* Glow layers */}
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(47,107,255,0.25), rgba(168,85,247,0.15), transparent 70%)",
            animation: "glowPulse 2.2s ease-in-out infinite",
            filter: "blur(12px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(53,199,255,0.25), transparent 70%)",
            animation: "glowPulse 2.6s ease-in-out infinite",
            filter: "blur(10px)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            animation: `
              logoEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1),
              logoPulse 2.2s ease-in-out 0.6s infinite
            `,
          }}
        >
          <Image
            src="/Celerey_Logo_dark.png"
            alt="Celerey"
            width={110}
            height={110}
            priority
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Shell ─────────────────────────────────────────────── */
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
  const [splashDone, setSplashDone] = useState(false);

  const progressPct = Math.min(
    ((currentStep - 1) / (totalSteps - 1)) * 100,
    100,
  );

  // Step 8 still bypasses shell
  if (currentStep === 8) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Splash (only on first mount) */}
      {!splashDone && <OnboardingSplash onDone={() => setSplashDone(true)} />}

      {/* Main UI */}
      <div
        style={{
          visibility: splashDone ? "visible" : "hidden",
        }}
        className="flex min-h-screen flex-col"
      >
        {/* ── Top Bar ───────────────── */}
        <header className="pt-6 pb-4">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 sm:px-6">
            <Image
              src="/Celerey_Logo_dark.png"
              alt="Celerey"
              width={100}
              height={100}
              priority
            />

            <div className="flex w-full items-center justify-between text-xs font-medium text-slate-500">
              <span>{STEP_LABELS[currentStep]}</span>
              <span className="tabular-nums">
                {currentStep} / {totalSteps - 1}
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </header>

        {/* ── Content ───────────────── */}
        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-2xl">
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

        {/* ── Footer ───────────────── */}
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
    </>
  );
}
