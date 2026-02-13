"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ProjectionInputs } from "@/components/dashboard/retirement/types";
import {
  formatCurrency,
  formatPct,
  parseMoney,
} from "@/components/dashboard/retirement/utils";

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

type ControlsCardProps = {
  simulationMode: boolean;
  editActual: boolean;
  actual: ProjectionInputs;
  sim: ProjectionInputs;
  reduceMotion: boolean;
  projectedNestEgg: number;
  requiredAmount: number;
  setActual: React.Dispatch<React.SetStateAction<ProjectionInputs>>;
  setSim: React.Dispatch<React.SetStateAction<ProjectionInputs>>;
  onSaveActual: () => void;
  onCancelEditActual: () => void;
  onCopyToSimulation: () => void;
  onSetRetirementAge: (v: number[]) => void;
  onSetMonthlySavings: (v: number[]) => void;
  onSetExpectedReturn: (v: number[]) => void;
  onStartSimulation: () => void;
};

export function ControlsCard({
  simulationMode,
  editActual,
  actual,
  sim,
  reduceMotion,
  projectedNestEgg,
  requiredAmount,
  setActual,
  setSim,
  onSaveActual,
  onCancelEditActual,
  onCopyToSimulation,
  onSetRetirementAge,
  onSetMonthlySavings,
  onSetExpectedReturn,
  onStartSimulation,
}: ControlsCardProps) {
  return (
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
                    Update your baseline. Simulation won’t overwrite this unless
                    you save.
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
                  onChange={(v) => setActual((p) => ({ ...p, currentAge: v }))}
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
                  onClick={onSaveActual}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Save changes
                </Button>
                <Button variant="secondary" onClick={onCancelEditActual}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={onCopyToSimulation}
                  title="Copy baseline into simulation"
                >
                  Copy to simulation
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

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
                onValueChange={onSetRetirementAge}
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
                onValueChange={onSetMonthlySavings}
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
                onValueChange={onSetExpectedReturn}
              />
            </div>

            <Separator />

            <motion.div layout className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Projected</div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(Math.round(projectedNestEgg))}
                </div>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Required</div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(Math.round(requiredAmount))}
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Current age</div>
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
                <div className="text-xs text-muted-foreground">Inflation</div>
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
                  onClick={onStartSimulation}
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
  );
}
