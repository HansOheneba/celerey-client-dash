"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ControlsCard } from "@/components/dashboard/retirement/controls-card";
import { ModeStrip } from "@/components/dashboard/retirement/mode-strip";
import { ReadinessCard } from "@/components/dashboard/retirement/readiness-card";
import { RetirementHeader } from "@/components/dashboard/retirement/header";
import { SummaryCard } from "@/components/dashboard/retirement/summary-card";
import {
  ProjectionInputs,
  StatusTone,
  AdjustmentRecommendations,
} from "@/components/dashboard/retirement/types";
import {
  compoundFutureValue,
  requiredNestEgg,
  calculateAdjustmentsToReachTarget,
} from "@/components/dashboard/retirement/utils";
import { getRetirementProjectionInputs } from "@/lib/client-data";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function RetirementProjectionsPage() {
  const reduceMotion = useReducedMotion();

  // Initialize from client data lib
  const initialData = getRetirementProjectionInputs();

  // "Actual" = what's saved in the user's profile (what backend will plug into)
  const [actual, setActual] = React.useState<ProjectionInputs>(initialData);

  // "Simulation" = adjustable scenario (starts as a copy of actual)
  const [sim, setSim] = React.useState<ProjectionInputs>(() => ({ ...actual }));

  // Mode: true = simulation controls active
  const [simulationMode, setSimulationMode] = React.useState<boolean>(true);

  // Editing "actual" controls visibility
  const [editActual, setEditActual] = React.useState<boolean>(false);

  // When switching to simulation, ensure sim is at least seeded from actual (one-time)
  React.useEffect(() => {
    // keep sim in sync ONLY when user is not actively simulating
    if (!simulationMode) return;
    // optional: comment this out if you want sim to be persistent and not auto-sync
    // setSim((p) => ({ ...p })); // noop
  }, [simulationMode]);

  const active = simulationMode ? sim : actual;

  const yearsToRetirement = React.useMemo(() => {
    return Math.max(0, active.retirementAge - active.currentAge);
  }, [active.retirementAge, active.currentAge]);

  const projectedNestEgg = React.useMemo(() => {
    return compoundFutureValue({
      pv: active.currentInvested,
      pmt: active.monthlySavings,
      years: yearsToRetirement,
      annualRate: active.expectedReturnPct / 100,
    });
  }, [
    active.currentInvested,
    active.monthlySavings,
    yearsToRetirement,
    active.expectedReturnPct,
  ]);

  const requiredAmount = React.useMemo(() => {
    return requiredNestEgg({
      desiredMonthlyIncomeToday: active.desiredMonthlyIncome,
      inflationRate: active.inflationPct / 100,
      years: yearsToRetirement,
      swr: active.safeWithdrawalRatePct / 100,
    });
  }, [
    active.desiredMonthlyIncome,
    active.inflationPct,
    yearsToRetirement,
    active.safeWithdrawalRatePct,
  ]);

  const projectedSurplus = React.useMemo(() => {
    return projectedNestEgg - requiredAmount;
  }, [projectedNestEgg, requiredAmount]);

  const fundedPct = React.useMemo(() => {
    if (!Number.isFinite(requiredAmount) || requiredAmount <= 0) return 0;
    return (projectedNestEgg / requiredAmount) * 100;
  }, [projectedNestEgg, requiredAmount]);

  const status = React.useMemo<StatusTone>(() => {
    if (fundedPct >= 110)
      return {
        tone: "good" as const,
        title: "You're on track for a comfortable retirement",
      };
    if (fundedPct >= 90)
      return {
        tone: "warn" as const,
        title: "You're close - small adjustments could help",
      };
    return {
      tone: "warn" as const,
      title: "You're behind target - consider adjustments",
    };
  }, [fundedPct]);

  const adjustments = React.useMemo<AdjustmentRecommendations>(() => {
    return calculateAdjustmentsToReachTarget({
      currentInvested: active.currentInvested,
      monthlySavings: active.monthlySavings,
      yearsToRetirement,
      expectedReturnPct: active.expectedReturnPct,
      requiredAmount,
      projectedNestEgg,
      currentAge: active.currentAge,
      retirementAge: active.retirementAge,
      desiredMonthlyIncome: active.desiredMonthlyIncome,
      inflationPct: active.inflationPct,
      safeWithdrawalRatePct: active.safeWithdrawalRatePct,
    });
  }, [
    active.currentInvested,
    active.monthlySavings,
    yearsToRetirement,
    active.expectedReturnPct,
    requiredAmount,
    projectedNestEgg,
    active.currentAge,
    active.retirementAge,
    active.desiredMonthlyIncome,
    active.inflationPct,
    active.safeWithdrawalRatePct,
  ]);

  // Slider helpers (Simulation only)
  function setRetirementAge(v: number[]) {
    setSim((p) => ({ ...p, retirementAge: v[0] ?? p.retirementAge }));
  }
  function setMonthlySavings(v: number[]) {
    setSim((p) => ({ ...p, monthlySavings: v[0] ?? p.monthlySavings }));
  }
  function setExpectedReturn(v: number[]) {
    setSim((p) => ({ ...p, expectedReturnPct: v[0] ?? p.expectedReturnPct }));
  }

  function resetSimulationFromActual() {
    setSim({ ...actual });
  }

  // "Save actual" placeholder (backend hookup later)
  function saveActual() {
    // call your API here
    // await fetch("/api/profile/retirement", { method: "POST", body: JSON.stringify(actual) })
    setEditActual(false);
  }

  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35 }}
        >
          <RetirementHeader
            simulationMode={simulationMode}
            onToggleSimulation={(value) => {
              setSimulationMode(value);
              resetSimulationFromActual();
            }}
            onResetSimulation={resetSimulationFromActual}
            onToggleEditActual={() => setEditActual((v) => !v)}
          />
        </motion.div>

        {/* Mode strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <ModeStrip simulationMode={simulationMode} />
        </motion.div>

        {/* Top summary card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <SummaryCard
            active={active}
            yearsToRetirement={yearsToRetirement}
            projectedNestEgg={projectedNestEgg}
            requiredAmount={requiredAmount}
            projectedSurplus={projectedSurplus}
          />
        </motion.div>

        {/* Bottom grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <ReadinessCard
            fundedPct={fundedPct}
            status={status}
            simulationMode={simulationMode}
            projectedSurplus={projectedSurplus}
            reduceMotion={!!reduceMotion}
            adjustments={adjustments}
          />

          <ControlsCard
            simulationMode={simulationMode}
            editActual={editActual}
            actual={actual}
            sim={sim}
            reduceMotion={!!reduceMotion}
            projectedNestEgg={projectedNestEgg}
            requiredAmount={requiredAmount}
            setActual={setActual}
            setSim={setSim}
            onSaveActual={saveActual}
            onCancelEditActual={() => setEditActual(false)}
            onCopyToSimulation={() => setSim({ ...actual })}
            onSetRetirementAge={setRetirementAge}
            onSetMonthlySavings={setMonthlySavings}
            onSetExpectedReturn={setExpectedReturn}
            onStartSimulation={() => {
              setSim({ ...actual });
              setSimulationMode(true);
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
