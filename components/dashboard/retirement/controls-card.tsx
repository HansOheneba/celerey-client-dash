"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Wand2 } from "lucide-react";

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
  explainer,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  explainer?: string;
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
      {explainer ? (
        <p className="text-[11px] text-muted-foreground/80 leading-snug">
          {explainer}
        </p>
      ) : null}
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
  explainer,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  explainer?: string;
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
      {explainer ? (
        <p className="text-[11px] text-muted-foreground/80 leading-snug">
          {explainer}
        </p>
      ) : null}
    </div>
  );
}

function SectionExplainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/40 dark:border-blue-800/30 px-3 py-2.5">
      <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
      <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
        {children}
      </p>
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
            ? "Drag the sliders to explore 'what-if' scenarios. Nothing is saved until you choose to."
            : "These are your baseline numbers — your current savings, pension, and goals. They power every projection on this page."}
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
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Your age
                  </Label>
                  <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-medium tabular-nums">
                    {actual.currentAge}
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 leading-snug">
                    Calculated from your date of birth.
                  </p>
                </div>
                <NumberInput
                  label="Retirement age"
                  value={actual.retirementAge}
                  min={35}
                  max={90}
                  onChange={(v) =>
                    setActual((p) => ({ ...p, retirementAge: v }))
                  }
                  explainer="When you plan to stop working full-time."
                />

                <MoneyInput
                  label="Current invested"
                  value={actual.currentInvested}
                  onChange={(v) =>
                    setActual((p) => ({ ...p, currentInvested: v }))
                  }
                  explainer="Total value of your non-pension investments (stocks, funds, etc.)."
                />
                <MoneyInput
                  label="Monthly savings"
                  value={actual.monthlySavings}
                  onChange={(v) =>
                    setActual((p) => ({ ...p, monthlySavings: v }))
                  }
                  explainer="How much you save or invest each month (outside of your pension)."
                />
              </div>

              <Separator className="my-4" />

              <div className="mb-2">
                <div className="text-sm font-semibold tracking-tight">
                  Pension &amp; Retirement Accounts
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Include any 401(k), IRA, pension plan, or other retirement
                  account you already have.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MoneyInput
                  label="Existing pension / retirement balance"
                  value={actual.existingPensionBalance}
                  onChange={(v) =>
                    setActual((p) => ({ ...p, existingPensionBalance: v }))
                  }
                  explainer="The total balance across all your retirement accounts today."
                />
                <MoneyInput
                  label="Monthly pension contribution"
                  value={actual.monthlyPensionContribution}
                  onChange={(v) =>
                    setActual((p) => ({ ...p, monthlyPensionContribution: v }))
                  }
                  explainer="Your monthly contribution (including any employer match)."
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
                  explainer="Average yearly growth you expect on your investments. Historically, equities average ~7-10%."
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
                  explainer="How much prices rise each year. We adjust your target income for this so you maintain purchasing power."
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
                  explainer="The % of your nest egg you can safely withdraw each year in retirement without running out. 4% is a common rule of thumb."
                />
                <MoneyInput
                  label="Desired monthly income"
                  value={actual.desiredMonthlyIncome}
                  hint="Today's dollars"
                  onChange={(v) =>
                    setActual((p) => ({ ...p, desiredMonthlyIncome: v }))
                  }
                  explainer="How much you'd like to spend per month in retirement, in today's money. We'll adjust for inflation automatically."
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
            <SectionExplainer>
              Move the sliders below to see how changing your retirement age,
              savings rate, or expected returns affects your projected nest egg.
              Your saved figures are not affected.
            </SectionExplainer>

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
              <p className="text-[11px] text-muted-foreground/80">
                Retiring later gives your money more time to grow.
              </p>
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
              <p className="text-[11px] text-muted-foreground/80">
                Total non-pension savings per month. Even small increases
                compound significantly over time.
              </p>
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
              <p className="text-[11px] text-muted-foreground/80">
                Average annual investment return. Conservative: 4-5% | Moderate:
                6-7% | Aggressive: 8-10%.
              </p>
            </div>

            <Separator />

            <motion.div layout className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Projected</div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(Math.round(projectedNestEgg))}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  What your savings + pension could grow to
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Required</div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(Math.round(requiredAmount))}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  The nest egg needed for your target income
                </p>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <SectionExplainer>
              Below is a snapshot of the figures driving your retirement
              projection. Click &quot;Edit actuals&quot; above to update them.
            </SectionExplainer>

            <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Investments
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Your age</div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {actual.currentAge}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  From your profile
                </p>
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
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  Non-pension investments
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">
                  Monthly savings
                </div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(actual.monthlySavings)}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  Outside of pension
                </p>
              </div>
            </div>

            <Separator />

            <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pension &amp; Retirement Accounts
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">
                  Pension balance
                </div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(actual.existingPensionBalance)}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  401(k), IRA, or other plan
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">
                  Monthly contribution
                </div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(actual.monthlyPensionContribution)}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  Incl. employer match
                </p>
              </div>
            </div>

            <Separator />

            <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Assumptions
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">
                  Expected return
                </div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatPct(actual.expectedReturnPct)}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  Yearly growth rate
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Inflation</div>
                <div className="mt-1 text-sm font-semibold tabular-nums">
                  {formatPct(actual.inflationPct)}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  Annual price increase
                </p>
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
                outcomes with sliders — nothing is saved.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
