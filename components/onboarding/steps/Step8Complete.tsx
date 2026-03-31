"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { getSubscription } from "@/lib/client-data";

interface Step8CompleteProps {
  /** display_name — works for solo (full name) and partner/family (household name) */
  displayName: string;
  goalCount: number;
  totalIncome: number;
}

export function Step8Complete({
  displayName,
  goalCount,
  totalIncome,
}: Step8CompleteProps) {
  const router = useRouter();

  function handleCta() {
    const sub = getSubscription();
    if (sub.status === "none") {
      router.push("/choose-plan");
    } else {
      router.push("/dashboard");
    }
  }

  useEffect(() => {
    // subtle confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const STATS = [
    { label: "Goals set", value: goalCount.toString() },
    {
      label: "Monthly income",
      value: `$${totalIncome.toLocaleString()}`,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3 max-w-md"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
          You're all set, {displayName}
        </h1>

        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
          Your dashboard is ready. You can now see your net worth, track your
          finances, and get a clear view of where you stand.
        </p>
      </motion.div>

      {/* Stats */}
      {/* <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm"
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 bg-white p-4"
          >
            <p className="text-xl sm:text-2xl font-semibold text-primary">
              {s.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div> */}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-10 w-full max-w-sm"
      >
        <Button
          type="button"
          onClick={handleCta}
          className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base rounded-xl"
        >
          Go to dashboard
        </Button>

        <p className="mt-3 text-xs text-slate-400">
          You can update your information anytime from your settings
        </p>
      </motion.div>

      {/* Logo */}
      <div className="mt-12 opacity-30">
        <Image
          src="https://i.ibb.co/PGVKSsV1/image.png"
          alt="Celerey"
          width={50}
          height={50}
        />
      </div>
    </div>
  );
}
