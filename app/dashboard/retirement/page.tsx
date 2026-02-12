"use client";

import * as React from "react";
import { Info, Pencil } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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

  // If rate is ~0, avoid division issues
  if (Math.abs(r) < 1e-9) return pv + pmt * months;

  // FV = PV*(1+r)^n + PMT * [((1+r)^n - 1) / r]
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
  // Inflate desired monthly income to retirement-year dollars:
  const desiredMonthlyAtRetirement =
    desiredMonthlyIncomeToday * Math.pow(1 + inflationRate, years);

  const annualIncomeAtRetirement = desiredMonthlyAtRetirement * 12;

  // Required portfolio = annual income / SWR
  if (swr <= 0) return Infinity;
  return annualIncomeAtRetirement / swr;
}

function ProgressBar({
  value,
  good = true,
}: {
  value: number; // 0..200+ (% funded)
  good?: boolean;
}) {
  const safe = clamp(value, 0, 200);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300",
          good ? "bg-emerald-600" : "bg-amber-600",
        )}
        style={{ width: `${safe / 2}%` }} // 200% => 100% width
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
    <div
      className={cn(
        "rounded-2xl bg-muted/30 p-4",
        accent === "good" ? "bg-emerald-50/60" : "",
      )}
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
    </div>
  );
}

export default function RetirementProjectionsPage() {
  const [inputs, setInputs] = React.useState<ProjectionInputs>({
    currentAge: 42,
    retirementAge: 55,
    currentInvested: 1250000,
    monthlySavings: 14300,
    expectedReturnPct: 7,
    inflationPct: 3,
    safeWithdrawalRatePct: 4,
    desiredMonthlyIncome: 18500,
  });

  const yearsToRetirement = React.useMemo(() => {
    return Math.max(0, inputs.retirementAge - inputs.currentAge);
  }, [inputs.retirementAge, inputs.currentAge]);

  const projectedNestEgg = React.useMemo(() => {
    return compoundFutureValue({
      pv: inputs.currentInvested,
      pmt: inputs.monthlySavings,
      years: yearsToRetirement,
      annualRate: inputs.expectedReturnPct / 100,
    });
  }, [
    inputs.currentInvested,
    inputs.monthlySavings,
    yearsToRetirement,
    inputs.expectedReturnPct,
  ]);

  const requiredAmount = React.useMemo(() => {
    return requiredNestEgg({
      desiredMonthlyIncomeToday: inputs.desiredMonthlyIncome,
      inflationRate: inputs.inflationPct / 100,
      years: yearsToRetirement,
      swr: inputs.safeWithdrawalRatePct / 100,
    });
  }, [
    inputs.desiredMonthlyIncome,
    inputs.inflationPct,
    yearsToRetirement,
    inputs.safeWithdrawalRatePct,
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

  // Slider helpers (shadcn Slider returns number[])
  function setRetirementAge(v: number[]) {
    setInputs((p) => ({ ...p, retirementAge: v[0] ?? p.retirementAge }));
  }
  function setMonthlySavings(v: number[]) {
    setInputs((p) => ({ ...p, monthlySavings: v[0] ?? p.monthlySavings }));
  }
  function setExpectedReturn(v: number[]) {
    setInputs((p) => ({
      ...p,
      expectedReturnPct: v[0] ?? p.expectedReturnPct,
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Retirement & Future Projections
            </h1>
            <p className="text-sm text-muted-foreground">
              Planning for financial independence.
            </p>
          </div>

          <Button variant="secondary" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit assumptions
          </Button>
        </div>

        {/* Top summary card */}
        <Card className="mt-6 border-muted/60 bg-background/60 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center">
              {/* Target age (big) */}
              <div className="rounded-2xl bg-muted/30 p-5">
                <div className="text-xs text-muted-foreground">
                  Retirement Target Age
                </div>
                <div className="mt-1 text-5xl font-semibold tabular-nums">
                  {inputs.retirementAge}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {yearsToRetirement} years from now
                </div>
              </div>

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
                value={formatCurrency(inputs.desiredMonthlyIncome)}
                hint="Target in today's dollars"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Readiness */}
          <Card className="border-muted/60 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Retirement Readiness</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <ProgressBar value={fundedPct} good={fundedPct >= 100} />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Current trajectory
                  </span>
                  <span className="tabular-nums">
                    {fundedPct.toFixed(0)}% funded
                  </span>
                </div>
              </div>

              <div
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
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-muted/30 p-4">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  This is a simplified projection using constant monthly savings
                  and an average annual return. Wire this to your real portfolio
                  + cashflow later.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scenario modeling */}
          <Card className="border-muted/60 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Scenario Modeling</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust assumptions to see impact on projections.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Retirement age */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Retirement Age:{" "}
                    <span className="text-foreground font-medium tabular-nums">
                      {inputs.retirementAge}
                    </span>
                  </span>
                  <Badge variant="secondary" className="tabular-nums">
                    {yearsToRetirement} yrs
                  </Badge>
                </div>
                <Slider
                  value={[inputs.retirementAge]}
                  min={45}
                  max={75}
                  step={1}
                  onValueChange={setRetirementAge}
                />
              </div>

              {/* Monthly savings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Monthly Savings:{" "}
                    <span className="text-foreground font-medium tabular-nums">
                      {formatCurrency(inputs.monthlySavings)}
                    </span>
                  </span>
                </div>
                <Slider
                  value={[inputs.monthlySavings]}
                  min={0}
                  max={30000}
                  step={100}
                  onValueChange={setMonthlySavings}
                />
              </div>

              {/* Expected return */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Expected Return:{" "}
                    <span className="text-foreground font-medium tabular-nums">
                      {formatPct(inputs.expectedReturnPct)}
                    </span>
                  </span>
                  <Badge variant="secondary">annual</Badge>
                </div>
                <Slider
                  value={[inputs.expectedReturnPct]}
                  min={0}
                  max={12}
                  step={0.5}
                  onValueChange={setExpectedReturn}
                />
              </div>

              <Separator />

              {/* Quick preview */}
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div className="text-xs text-muted-foreground">
                Tip: increase savings or delay retirement to improve funded
                percentage.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
