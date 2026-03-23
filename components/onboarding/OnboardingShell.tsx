"use client";

// components/onboarding/OnboardingShell.tsx
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const STEP_LABELS: Record<number, string> = {
  1: "Account Setup",
  2: "Personal Info",
  3: "Your Goals",
  4: "Income",
  5: "Emergency Fund",
  6: "Retirement",
  7: "Review",
  8: "All Done",
};

// Map each step to one of the named stages shown in the indicator
// We group the 8 steps into 4 visible stages
const STAGES = [
  { label: "Account", steps: [1] },
  { label: "Profile", steps: [2] },
  { label: "Finances", steps: [3, 4, 5, 6] },
  { label: "Review", steps: [7, 8] },
];

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
        <div
          style={{
            animation: `
              logoEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1),
              logoPulse 2.2s ease-in-out 0.6s infinite
            `,
          }}
        >
          <Image
            src="https://i.ibb.co/PGVKSsV1/image.png"
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

/* ─── Step Indicator ─────────────────────────────────────────── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  // Find which stage the current step belongs to
  const currentStageIndex = STAGES.findIndex((s) =>
    s.steps.includes(currentStep),
  );

  return (
    <div className="flex items-center justify-center gap-0">
      {STAGES.map((stage, i) => {
        const isCompleted = i < currentStageIndex;
        const isActive = i === currentStageIndex;

        return (
          <React.Fragment key={stage.label}>
            {/* Node */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted
                    ? "#151339"
                    : isActive
                      ? "#151339"
                      : "transparent",
                  borderColor: isCompleted || isActive ? "#151339" : "#d1d5db",
                  scale: isActive ? 1.08 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2"
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2.5 7L5.5 10L11.5 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isCompleted || isActive ? "text-slate-800" : "text-gray-400"
                }`}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector line between nodes */}
            {i < STAGES.length - 1 && (
              <div className="relative mx-2 mb-5 h-0.5 w-16 sm:w-24 bg-gray-200 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 bg-slate-800"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Main Shell ─────────────────────────────────────────────── */
interface OnboardingShellProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
}

export function OnboardingShell({
  currentStep,
  totalSteps,
  children,
}: OnboardingShellProps) {
  const [splashDone, setSplashDone] = useState(false);

  // Step 8 (Complete) bypasses shell
  if (currentStep === 8) {
    return <>{children}</>;
  }

  return (
    <>
      {!splashDone && <OnboardingSplash onDone={() => setSplashDone(true)} />}

      <div
        style={{
          visibility: splashDone ? "visible" : "hidden",
          background: `
            radial-gradient(circle at 20% 10%, rgba(47,107,255,0.06), transparent 40%),
            radial-gradient(circle at 80% 90%, rgba(168,85,247,0.06), transparent 50%),
            #ffffff
          `,
        }}
        className="flex min-h-screen flex-col"
      >
        {/* ── Top Bar ───────────────── */}
        <header className="pt-8 pb-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 sm:px-6">
            <Image
              src="https://i.ibb.co/PGVKSsV1/image.png"
              alt="Celerey"
              width={100}
              height={100}
              priority
            />

            <StepIndicator currentStep={currentStep} />
          </div>
        </header>

        {/* ── Content ───────────────── */}
        <main className="flex flex-1 justify-center items-center px-4 pt-4 pb-10 sm:px-6">
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
      </div>
    </>
  );
}
