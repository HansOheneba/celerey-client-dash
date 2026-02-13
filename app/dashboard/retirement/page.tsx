"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Info,
  Pencil,
  RefreshCcw,
  Wand2,
  SlidersHorizontal,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProjectionInputs = {
  currentAge: number;
  retirementAge: number;
  currentInvested: number; // starting portfolio
  monthlySavings: number;
  expectedReturnPct: number; // annual %
  inflationPct: number; // annual %
  safeWithdrawalRatePct: number; // annual %
  desiredMonthlyIncome: number; // in retirement, in today's dollars
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function compoundFutureValue({
  pv,
  pmt,
  years,
  annualRate,
}: {
  pv: number;
  pmt: number; // monthly
  years: number;
  annualRate: number; // decimal, e.g. 0.07
}): number {
  const months = Math.max(0, Math.round(years * 12));
  const r = annualRate / 12;

  if (months === 0) return pv;
  if (Math.abs(r) < 1e-9) return pv + pmt * months;

  const factor = Math.pow(1 + r, months);
  return pv * factor + pmt * ((factor - 1) / r);
}

function requiredNestEgg({
  desiredMonthlyIncomeToday,
  inflationRate,
  years,
  swr,
}: {
  desiredMonthlyIncomeToday: number;
  inflationRate: number; // decimal annual
  years: number;
  swr: number; // decimal annual, e.g. 0.04
}): number {
  const desiredMonthlyAtRetirement =
    desiredMonthlyIncomeToday * Math.pow(1 + inflationRate, years);
  const annualIncomeAtRetirement = desiredMonthlyAtRetirement * 12;
  if (swr <= 0) return Infinity;
  return annualIncomeAtRetirement / swr;
}

function ProgressBar({
  value,
  good = true,
  reduceMotion,
}: {
  value: number; // 0..200+ (% funded)
  good?: boolean;
  reduceMotion: boolean;
}) {
  const safe = clamp(value, 0, 200);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn(
          "h-full rounded-full",
          good ? "bg-emerald-600" : "bg-amber-600",
        )}
        initial={false}
        animate={{ width: `${safe / 2}%` }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
      />
    </div>
  );
}

function MiniKpi({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent?: "good";
  hint?: string;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl bg-muted/30 p-4",
        accent === "good" ? "bg-emerald-50/60" : "",
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          accent === "good" ? "text-emerald-700 dark:text-emerald-500" : "",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

function parseMoney(input: string): number {
  const cleaned = input.replace(/[^\d.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function MoneyInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const [raw, setRaw] = React.useState<string>(String(value));

  React.useEffect(() => {
    setRaw(String(value));
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      <Input
        inputMode="decimal"
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          setRaw(v);
          onChange(parseMoney(v));
        }}
        className="bg-background/60"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="bg-background/60"
        />
        {suffix ? (
          <Badge variant="secondary" className="tabular-nums">
            {suffix}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export default function RetirementProjectionsPage() {
  const reduceMotion = useReducedMotion();

  // "Actual" = what's saved in the user's profile (what backend will plug into)
  const [actual, setActual] = React.useState<ProjectionInputs>({
    currentAge: 42,
    retirementAge: 55,
    currentInvested: 1250000,
    monthlySavings: 14300,
    expectedReturnPct: 7,
    inflationPct: 3,
    safeWithdrawalRatePct: 4,
    desiredMonthlyIncome: 18500,
  });

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

  const status = React.useMemo(() => {
    if (fundedPct >= 110)
      return {
        tone: "good" as const,
        title: "You're on track for a comfortable retirement",
      };
    if (fundedPct >= 90)
      return {
        tone: "warn" as const,
        title: "You're close — small adjustments could help",
      };
    return {
      tone: "warn" as const,
      title: "You're behind target — consider adjustments",
    };
  }, [fundedPct]);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Retirement &amp; Future Projections
            </h1>
            <p className="text-sm text-muted-foreground">
              View your current plan, then explore scenarios with simulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl bg-background/60 px-3 py-2 border border-muted/60">
              <Label className="text-xs text-muted-foreground">
                Simulation
              </Label>
              <Switch
                checked={simulationMode}
                onCheckedChange={(v) => {
                  setSimulationMode(v);
                  resetSimulationFromActual();
                }}
              />
              <Badge variant="secondary" className="tabular-nums">
                {simulationMode ? "On" : "Off"}
              </Badge>
            </div>

            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => setEditActual((v) => !v)}
            >
              <Pencil className="h-4 w-4" />
              Edit actuals
            </Button>

            {simulationMode ? (
              <Button
                variant="secondary"
                className="gap-2"
                onClick={resetSimulationFromActual}
                title="Reset simulation to match your actual figures"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset sim
              </Button>
            ) : null}
          </div>
        </motion.div>

        {/* Mode strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <Badge variant="secondary" className="gap-2">
            {simulationMode ? (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                Simulation view
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Actual view
              </>
            )}
          </Badge>

          {simulationMode ? (
            <span className="text-xs text-muted-foreground">
              Adjust sliders to explore “what-if” outcomes without changing your
              saved figures.
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              This reflects your saved profile and is what your advisor will
              use.
            </span>
          )}
        </motion.div>

        {/* Top summary card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Card className="mt-6 border-muted/60 bg-background/60 shadow-sm">
            <CardContent className="p-6">
              <motion.div
                layout
                className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center"
              >
                <motion.div
                  layout
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl bg-muted/30 p-5"
                >
                  <div className="text-xs text-muted-foreground">
                    Retirement Target Age
                  </div>
                  <div className="mt-1 text-5xl font-semibold tabular-nums">
                    {active.retirementAge}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {yearsToRetirement} years from now
                  </div>
                </motion.div>

                <MiniKpi
                  label="Projected Nest Egg"
                  value={formatCurrency(Math.round(projectedNestEgg))}
                />
                <MiniKpi
                  label="Required Amount"
                  value={formatCurrency(Math.round(requiredAmount))}
                />
                <MiniKpi
                  label="Projected Surplus"
                  value={formatCurrency(Math.round(projectedSurplus))}
                  accent={projectedSurplus >= 0 ? "good" : undefined}
                />
                <MiniKpi
                  label="Monthly Income"
                  value={formatCurrency(active.desiredMonthlyIncome)}
                  hint="Target in today's dollars"
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {/* Readiness */}
          <Card className="border-muted/60 bg-background/60 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">
                  Retirement Readiness
                </CardTitle>
                <Badge variant="secondary" className="tabular-nums">
                  {fundedPct.toFixed(0)}% funded
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <ProgressBar
                  value={fundedPct}
                  good={fundedPct >= 100}
                  reduceMotion={!!reduceMotion}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {simulationMode
                      ? "Simulated trajectory"
                      : "Current trajectory"}
                  </span>
                  <span className="tabular-nums">{fundedPct.toFixed(0)}%</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${status.tone}-${Math.round(fundedPct)}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                  className={cn(
                    "rounded-xl border p-4",
                    status.tone === "good"
                      ? "border-emerald-200/60 bg-emerald-50/60"
                      : "border-amber-200/60 bg-amber-50/60",
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      status.tone === "good"
                        ? "text-emerald-900"
                        : "text-amber-900",
                    )}
                  >
                    {status.title}
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    Projections show{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(Math.abs(Math.round(projectedSurplus)))}
                    </span>{" "}
                    {projectedSurplus >= 0 ? "above" : "below"} your target.
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-start gap-2 rounded-xl bg-muted/30 p-4">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Toggle between your saved figures and simulation to explore
                  different outcomes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Controls / Inputs */}
          <Card className="border-muted/60 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                {simulationMode ? "Simulation Controls" : "Your Figures"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {simulationMode
                  ? "Adjust assumptions to see how your projection could change."
                  : "These are the figures used as your baseline."}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Actuals editor (inputs) */}
              <AnimatePresence initial={false}>
                {editActual ? (
                  <motion.div
                    key="actual-editor"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    className="rounded-2xl border border-muted/60 bg-muted/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold tracking-tight">
                          Edit your actual figures
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Update your baseline. Simulation won’t overwrite this
                          unless you save.
                        </div>
                      </div>

                      <Badge variant="secondary">baseline</Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <NumberInput
                        label="Current age"
                        value={actual.currentAge}
                        min={18}
                        max={90}
                        onChange={(v) =>
                          setActual((p) => ({ ...p, currentAge: v }))
                        }
                      />
                      <NumberInput
                        label="Retirement age"
                        value={actual.retirementAge}
                        min={35}
                        max={90}
                        onChange={(v) =>
                          setActual((p) => ({ ...p, retirementAge: v }))
                        }
                      />

                      <MoneyInput
                        label="Current invested"
                        value={actual.currentInvested}
                        onChange={(v) =>
                          setActual((p) => ({ ...p, currentInvested: v }))
                        }
                      />
                      <MoneyInput
                        label="Monthly savings"
                        value={actual.monthlySavings}
                        onChange={(v) =>
                          setActual((p) => ({ ...p, monthlySavings: v }))
                        }
                      />

                      <NumberInput
                        label="Expected return"
                        value={actual.expectedReturnPct}
                        min={0}
                        max={20}
                        step={0.1}
                        suffix="%"
                        onChange={(v) =>
                          setActual((p) => ({ ...p, expectedReturnPct: v }))
                        }
                      />
                      <NumberInput
                        label="Inflation"
                        value={actual.inflationPct}
                        min={0}
                        max={15}
                        step={0.1}
                        suffix="%"
                        onChange={(v) =>
                          setActual((p) => ({ ...p, inflationPct: v }))
                        }
                      />

                      <NumberInput
                        label="Safe withdrawal rate"
                        value={actual.safeWithdrawalRatePct}
                        min={1}
                        max={8}
                        step={0.1}
                        suffix="%"
                        onChange={(v) =>
                          setActual((p) => ({ ...p, safeWithdrawalRatePct: v }))
                        }
                      />
                      <MoneyInput
                        label="Desired monthly income"
                        value={actual.desiredMonthlyIncome}
                        hint="Today's dollars"
                        onChange={(v) =>
                          setActual((p) => ({ ...p, desiredMonthlyIncome: v }))
                        }
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={saveActual}
                        className="bg-foreground text-background hover:bg-foreground/90"
                      >
                        Save changes
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditActual(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setSim({ ...actual })}
                        title="Copy baseline into simulation"
                      >
                        Copy to simulation
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Simulation sliders */}
              {simulationMode ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Retirement Age:{" "}
                        <span className="text-foreground font-medium tabular-nums">
                          {sim.retirementAge}
                        </span>
                      </span>
                      <Badge variant="secondary" className="tabular-nums">
                        {Math.max(0, sim.retirementAge - sim.currentAge)} yrs
                      </Badge>
                    </div>
                    <Slider
                      value={[sim.retirementAge]}
                      min={45}
                      max={75}
                      step={1}
                      onValueChange={setRetirementAge}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Monthly Savings:{" "}
                        <span className="text-foreground font-medium tabular-nums">
                          {formatCurrency(sim.monthlySavings)}
                        </span>
                      </span>
                    </div>
                    <Slider
                      value={[sim.monthlySavings]}
                      min={0}
                      max={30000}
                      step={100}
                      onValueChange={setMonthlySavings}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Expected Return:{" "}
                        <span className="text-foreground font-medium tabular-nums">
                          {formatPct(sim.expectedReturnPct)}
                        </span>
                      </span>
                      <Badge variant="secondary">annual</Badge>
                    </div>
                    <Slider
                      value={[sim.expectedReturnPct]}
                      min={0}
                      max={12}
                      step={0.5}
                      onValueChange={setExpectedReturn}
                    />
                  </div>

                  <Separator />

                  <motion.div layout className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Projected
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {formatCurrency(Math.round(projectedNestEgg))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Required
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {formatCurrency(Math.round(requiredAmount))}
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Actual figures display (read-only view) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Current age
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {actual.currentAge}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Retirement age
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {actual.retirementAge}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Current invested
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {formatCurrency(actual.currentInvested)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Monthly savings
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {formatCurrency(actual.monthlySavings)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Expected return
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {formatPct(actual.expectedReturnPct)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-4">
                      <div className="text-xs text-muted-foreground">
                        Inflation
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums">
                        {formatPct(actual.inflationPct)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-muted/60 bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold tracking-tight">
                        Want to explore scenarios?
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => {
                          setSim({ ...actual });
                          setSimulationMode(true);
                        }}
                      >
                        <Wand2 className="h-4 w-4" />
                        Start simulation
                      </Button>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Simulation starts from your baseline and lets you adjust
                      outcomes with sliders.
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
