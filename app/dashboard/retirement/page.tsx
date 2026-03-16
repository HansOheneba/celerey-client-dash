"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faArrowTrendUp,
  faArrowTrendDown,
  faPiggyBank,
  faCalendarDays,
  faCircleCheck,
  faCircleExclamation,
  faTriangleExclamation,
  faChartLine,
  faSackDollar,
  faHourglassHalf,
  faUserClock,
  faPencil,
  faRotateRight,
  faInfoCircle,
  faShieldHalved,
  faBuildingColumns,
  faCoins,
  faSliders,
  faFlaskVial,
  faArrowRight,
  faXmark,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  mockRetirementConfig,
  selectRetirementOutputs,
  formatCurrency,
  getUserAge,
  mockUser,
  type RetirementConfig,
} from "@/lib/client-data";

// ─── Colors ───────────────────────────────────────────────────────────────────
const NAVY = "#1e3a5f";
const BLUE = "#7eb8e8";
const GREEN = "#10b981";
const AMBER = "#f59e0b";
const RED = "#ef4444";

// ─── Projection helper ────────────────────────────────────────────────────────
function futureValue(
  pv: number,
  monthly: number,
  annualRate: number,
  years: number,
): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return pv + monthly * n;
  const g = Math.pow(1 + r, n);
  return pv * g + monthly * ((g - 1) / r);
}

function buildProjectionCurve(config: RetirementConfig) {
  const points = [];
  const currentAge = getUserAge(mockUser);
  const yearsToRetirement = config.retirementAge - currentAge;
  const step = Math.max(1, Math.ceil(yearsToRetirement / 20));

  for (let y = 0; y <= yearsToRetirement; y += step) {
    const balance = futureValue(
      config.currentInvested + config.existingPensionBalance,
      config.monthlySavings + config.monthlyPensionContribution,
      config.expectedReturnPct,
      y,
    );
    points.push({
      age: currentAge + y,
      balance,
      year: new Date().getFullYear() + y,
    });
  }

  // Always include the final retirement age point
  const finalBalance = futureValue(
    config.currentInvested + config.existingPensionBalance,
    config.monthlySavings + config.monthlyPensionContribution,
    config.expectedReturnPct,
    yearsToRetirement,
  );
  if (points[points.length - 1].age !== config.retirementAge) {
    points.push({
      age: config.retirementAge,
      balance: finalBalance,
      year: new Date().getFullYear() + yearsToRetirement,
    });
  }
  return points;
}

// ─── Tooltip for chart ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background shadow-md px-3 py-2.5 text-xs min-w-[160px] space-y-1">
      <p className="font-semibold text-foreground">Age {label}</p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Info tooltip wrapper ─────────────────────────────────────────────────────
function InfoTip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <UITooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-flex">
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs">
          {content}
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

// ─── Stat row ─────────────────────────────────────────────────────────────────
function StatRow({
  label,
  value,
  tip,
  valueClass,
}: {
  label: string;
  value: string;
  tip?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 border-b last:border-b-0">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {label} {tip && <InfoTip content={tip} />}
      </span>
      <span
        className={`font-semibold tabular-nums ${valueClass ?? "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────
function EditRetirementDialog({
  open,
  onClose,
  config,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  config: RetirementConfig;
  onSave: (c: RetirementConfig) => void;
}) {
  const [draft, setDraft] = React.useState<RetirementConfig>(config);
  React.useEffect(() => {
    if (open) setDraft(config);
  }, [open, config]);

  const MONEY_KEYS = new Set([
    "currentInvested",
    "existingPensionBalance",
    "monthlySavings",
    "monthlyPensionContribution",
    "desiredMonthlyIncome",
  ]);

  function field(key: keyof RetirementConfig) {
    const num = draft[key] as number;
    const isMoney = MONEY_KEYS.has(key);
    return {
      value: isMoney ? num.toLocaleString("en-US") : String(num),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const stripped = e.target.value.replace(/,/g, "");
        setDraft((d) => ({
          ...d,
          [key]: stripped === "" ? 0 : Number(stripped),
        }));
      },
    };
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FontAwesomeIcon icon={faPencil} className="h-4 w-4 text-primary" />
            Edit Retirement Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Age & Timeline */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Timeline
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  key: "retirementAge" as const,
                  label: "Retirement Age",
                  tip: "The age at which you plan to stop working.",
                },
                {
                  key: "lifeExpectancy" as const,
                  label: "Life Expectancy",
                  tip: "Used to calculate how long your savings need to last.",
                },
              ].map(({ key, label, tip }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    {label} <InfoTip content={tip} />
                  </Label>
                  <Input type="text" inputMode="numeric" {...field(key)} />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Balances */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Current Balances
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  key: "currentInvested" as const,
                  label: "Invested Today",
                  tip: "Total value of your current investment portfolio.",
                },
                {
                  key: "existingPensionBalance" as const,
                  label: "Pension Balance",
                  tip: "Current balance in your pension or 401k account.",
                },
              ].map(({ key, label, tip }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    {label} <InfoTip content={tip} />
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      className="pl-6"
                      {...field(key)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Monthly contributions */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Monthly Contributions
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  key: "monthlySavings" as const,
                  label: "Investment Savings",
                  tip: "Amount you invest each month from your income.",
                },
                {
                  key: "monthlyPensionContribution" as const,
                  label: "Pension Contribution",
                  tip: "Monthly amount added to your pension or 401k.",
                },
              ].map(({ key, label, tip }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    {label} <InfoTip content={tip} />
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      className="pl-6"
                      {...field(key)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Assumptions */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Assumptions
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  key: "expectedReturnPct" as const,
                  label: "Expected Return %",
                  tip: "Annual investment return rate. Historical S&P 500 average is ~7% inflation-adjusted.",
                },
                {
                  key: "inflationPct" as const,
                  label: "Inflation Rate %",
                  tip: "Expected annual inflation. Used to adjust your future purchasing power.",
                },
                {
                  key: "safeWithdrawalRatePct" as const,
                  label: "Safe Withdrawal %",
                  tip: "The '4% rule' — the percentage of your portfolio you withdraw each year in retirement.",
                },
                {
                  key: "desiredMonthlyIncome" as const,
                  label: "Desired Income/mo",
                  tip: "How much monthly income you want in retirement (today's dollars).",
                },
              ].map(({ key, label, tip }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    {label} <InfoTip content={tip} />
                  </Label>
                  <div className="relative">
                    {key === "desiredMonthlyIncome" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        $
                      </span>
                    )}
                    <Input
                      type={key.endsWith("Pct") ? "number" : "text"}
                      inputMode={key.endsWith("Pct") ? undefined : "numeric"}
                      step={key.endsWith("Pct") ? "0.1" : undefined}
                      className={key === "desiredMonthlyIncome" ? "pl-6" : ""}
                      {...field(key)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Simulator Panel ──────────────────────────────────────────────────────────
function SimulatorPanel({
  base,
  currentAge,
}: {
  base: RetirementConfig;
  currentAge: number;
}) {
  const [simRetirementAge, setSimRetirementAge] = React.useState(
    base.retirementAge,
  );
  const [simMonthlySavings, setSimMonthlySavings] = React.useState(
    base.monthlySavings,
  );
  const [simReturn, setSimReturn] = React.useState(base.expectedReturnPct);
  const [simDesiredIncome, setSimDesiredIncome] = React.useState(
    base.desiredMonthlyIncome,
  );

  const simConfig: RetirementConfig = {
    ...base,
    retirementAge: simRetirementAge,
    monthlySavings: simMonthlySavings,
    expectedReturnPct: simReturn,
    desiredMonthlyIncome: simDesiredIncome,
  };

  const baseOutputs = selectRetirementOutputs(base);
  const simOutputs = selectRetirementOutputs(simConfig);

  const baseProjection = buildProjectionCurve(base);
  const simProjection = buildProjectionCurve(simConfig);

  // Merge for dual-line chart
  const maxLen = Math.max(baseProjection.length, simProjection.length);
  const merged = Array.from({ length: maxLen }, (_, i) => ({
    age: (baseProjection[i] ?? simProjection[i]).age,
    base: baseProjection[i]?.balance ?? null,
    simulated: simProjection[i]?.balance ?? null,
  }));

  const changed =
    simRetirementAge !== base.retirementAge ||
    simMonthlySavings !== base.monthlySavings ||
    simReturn !== base.expectedReturnPct ||
    simDesiredIncome !== base.desiredMonthlyIncome;

  const balanceDelta =
    simOutputs.projectedBalanceAtRetirement -
    baseOutputs.projectedBalanceAtRetirement;
  const incomeDelta =
    simOutputs.sustainableMonthlyIncome - baseOutputs.sustainableMonthlyIncome;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retirement Age */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5 font-semibold">
              <FontAwesomeIcon
                icon={faUserClock}
                className="h-3.5 w-3.5 text-amber-500"
              />
              Retirement Age
              <InfoTip content="Slide to see how retiring earlier or later changes your projected balance." />
            </Label>
            <span className="text-sm font-bold tabular-nums">
              {simRetirementAge}
            </span>
          </div>
          <Slider
            min={currentAge + 1}
            max={80}
            step={1}
            value={[simRetirementAge]}
            onValueChange={([v]) => setSimRetirementAge(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Age {currentAge + 1}</span>
            <span>Age 80</span>
          </div>
        </div>

        {/* Monthly Savings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5 font-semibold">
              <FontAwesomeIcon
                icon={faPiggyBank}
                className="h-3.5 w-3.5 text-emerald-500"
              />
              Monthly Savings
              <InfoTip content="Total monthly contribution to investments and pension combined." />
            </Label>
            <span className="text-sm font-bold tabular-nums">
              {formatCurrency(simMonthlySavings)}
            </span>
          </div>
          <Slider
            min={500}
            max={50000}
            step={500}
            value={[simMonthlySavings]}
            onValueChange={([v]) => setSimMonthlySavings(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$500/mo</span>
            <span>$50,000/mo</span>
          </div>
        </div>

        {/* Expected Return */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5 font-semibold">
              <FontAwesomeIcon
                icon={faChartLine}
                className="h-3.5 w-3.5 text-blue-500"
              />
              Expected Annual Return
              <InfoTip content="Historical S&P 500 real return is ~7%. Conservative portfolios typically return 4–5%." />
            </Label>
            <span className="text-sm font-bold tabular-nums">{simReturn}%</span>
          </div>
          <Slider
            min={1}
            max={15}
            step={0.5}
            value={[simReturn]}
            onValueChange={([v]) => setSimReturn(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Desired Income */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5 font-semibold">
              <FontAwesomeIcon
                icon={faSackDollar}
                className="h-3.5 w-3.5 text-violet-500"
              />
              Desired Monthly Income
              <InfoTip content="How much monthly income you want in retirement in today's dollars." />
            </Label>
            <span className="text-sm font-bold tabular-nums">
              {formatCurrency(simDesiredIncome)}
            </span>
          </div>
          <Slider
            min={1000}
            max={50000}
            step={500}
            value={[simDesiredIncome]}
            onValueChange={([v]) => setSimDesiredIncome(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$1,000/mo</span>
            <span>$50,000/mo</span>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <AnimatePresence>
        {changed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              {
                label: "Projected Balance",
                base: formatCurrency(baseOutputs.projectedBalanceAtRetirement),
                sim: formatCurrency(simOutputs.projectedBalanceAtRetirement),
                delta: balanceDelta,
              },
              {
                label: "Monthly Income",
                base: formatCurrency(baseOutputs.sustainableMonthlyIncome),
                sim: formatCurrency(simOutputs.sustainableMonthlyIncome),
                delta: incomeDelta,
              },
              {
                label: "Years to Retire",
                base: `${baseOutputs.yearsToRetirement}yr`,
                sim: `${simOutputs.yearsToRetirement}yr`,
                delta:
                  simOutputs.yearsToRetirement - baseOutputs.yearsToRetirement,
                invertDelta: true,
              },
              {
                label: "On Track",
                base: baseOutputs.onTrack ? "Yes" : "No",
                sim: simOutputs.onTrack ? "Yes" : "No",
                delta:
                  simOutputs.onTrack && !baseOutputs.onTrack
                    ? 1
                    : !simOutputs.onTrack && baseOutputs.onTrack
                      ? -1
                      : 0,
                isStatus: true,
              },
            ].map((item) => {
              const positive = item.invertDelta
                ? item.delta <= 0
                : item.delta >= 0;
              const color =
                item.delta === 0
                  ? "text-foreground"
                  : positive
                    ? "text-emerald-600"
                    : "text-red-500";
              return (
                <div
                  key={item.label}
                  className="rounded-lg border bg-muted/30 px-3 py-2.5 space-y-1"
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs line-through text-muted-foreground/60">
                      {item.base}
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-2.5 w-2.5 text-muted-foreground"
                    />
                    <span className={`text-xs font-bold ${color}`}>
                      {item.sim}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dual projection chart */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-6 rounded-full"
              style={{ backgroundColor: NAVY }}
            />
            Current plan
          </div>
          {changed && (
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-6 rounded-full"
                style={{ backgroundColor: BLUE }}
              />
              Simulated
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={merged}
            margin={{ left: 16, right: 16, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="currentColor"
              strokeOpacity={0.1}
            />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              width={56}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              dataKey="base"
              name="Current plan"
              stroke={NAVY}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            {changed && (
              <Line
                dataKey="simulated"
                name="Simulated"
                stroke={BLUE}
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Reset */}
      {changed && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => {
              setSimRetirementAge(base.retirementAge);
              setSimMonthlySavings(base.monthlySavings);
              setSimReturn(base.expectedReturnPct);
              setSimDesiredIncome(base.desiredMonthlyIncome);
            }}
          >
            <FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" /> Reset
            to current plan
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RetirementPage() {
  const router = useRouter();
  const currentAge = getUserAge(mockUser);

  const [config, setConfig] =
    React.useState<RetirementConfig>(mockRetirementConfig);
  const [editOpen, setEditOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "simulator" | "insights"
  >("overview");

  const outputs = React.useMemo(
    () => selectRetirementOutputs(config),
    [config],
  );
  const projection = React.useMemo(
    () => buildProjectionCurve(config),
    [config],
  );

  const progressPct = Math.min(
    (config.currentInvested / outputs.projectedBalanceAtRetirement) * 100,
    100,
  );

  const incomeGapAbs = Math.abs(outputs.incomeGap);
  const onTrack = outputs.onTrack;
  const gapDirection = outputs.incomeGap < 0 ? "shortfall" : "surplus";
  const totalMonthly =
    config.monthlySavings + config.monthlyPensionContribution;
  const totalInvested = config.currentInvested + config.existingPensionBalance;

  // Insights
  const insights = React.useMemo(() => {
    const list: {
      level: "good" | "warning" | "danger" | "info";
      title: string;
      body: string;
      icon: any;
    }[] = [];

    if (onTrack) {
      list.push({
        level: "good",
        title: "You're on track to retire comfortably",
        body: `At your current savings rate of ${formatCurrency(totalMonthly)}/mo, you're projected to reach ${formatCurrency(outputs.projectedBalanceAtRetirement)} by age ${config.retirementAge} — enough to sustain ${formatCurrency(outputs.sustainableMonthlyIncome)}/mo.`,
        icon: faCircleCheck,
      });
    } else {
      list.push({
        level: "danger",
        title: `Income shortfall of ${formatCurrency(incomeGapAbs)}/mo`,
        body: `Your projected sustainable income of ${formatCurrency(outputs.sustainableMonthlyIncome)}/mo falls short of your desired ${formatCurrency(config.desiredMonthlyIncome)}/mo. Increasing contributions or adjusting your retirement age can close this gap.`,
        icon: faTriangleExclamation,
      });
    }

    if (
      config.monthlySavings /
        (config.monthlySavings + config.monthlyPensionContribution || 1) <
      0.3
    ) {
      list.push({
        level: "info",
        title: "Heavy pension reliance",
        body: `${Math.round((config.monthlyPensionContribution / totalMonthly) * 100)}% of your contributions are going to pension. Consider diversifying into personal investments for more flexibility in retirement.`,
        icon: faBuildingColumns,
      });
    }

    if (outputs.yearsToRetirement <= 5) {
      list.push({
        level: "warning",
        title: "Approaching retirement",
        body: `With only ${outputs.yearsToRetirement} years to go, consider shifting to more conservative allocations to protect your portfolio from market volatility close to retirement.`,
        icon: faHourglassHalf,
      });
    }

    if (config.expectedReturnPct > 9) {
      list.push({
        level: "warning",
        title: "Optimistic return assumption",
        body: `You're projecting ${config.expectedReturnPct}% annual returns. Historical real returns for diversified portfolios average 6–7%. Consider stress-testing with a lower rate using the simulator.`,
        icon: faChartLine,
      });
    }

    if (progressPct >= 50 && progressPct < 75) {
      list.push({
        level: "info",
        title: "Halfway there",
        body: `You've accumulated ${progressPct.toFixed(0)}% of your projected retirement balance. Maintaining current contributions keeps you on schedule.`,
        icon: faLightbulb,
      });
    }

    return list.slice(0, 4);
  }, [config, outputs, onTrack, incomeGapAbs, totalMonthly, progressPct]);

  const kpiItems = [
    {
      label: "Projected Balance",
      value: formatCurrency(outputs.projectedBalanceAtRetirement),
      subline: `At age ${config.retirementAge}`,
      tone: onTrack ? ("good" as const) : ("warning" as const),
      // icon: (
      //   <FontAwesomeIcon
      //     icon={faSackDollar}
      //     className="h-4 w-4 text-emerald-500"
      //   />
      // ),
    },
    {
      label: "Sustainable Income",
      value: `${formatCurrency(outputs.sustainableMonthlyIncome)}/mo`,
      subline: `Based on ${config.safeWithdrawalRatePct}% withdrawal rate`,
      tone: onTrack ? ("good" as const) : ("danger" as const),
      // icon: (
      //   <FontAwesomeIcon icon={faCoins} className="h-4 w-4 text-amber-500" />
      // ),
    },
    {
      label: "Years to Retirement",
      value: `${outputs.yearsToRetirement} years`,
      subline: `Retire at age ${config.retirementAge}`,
      tone: "neutral" as const,
      // icon: (
      //   <FontAwesomeIcon
      //     icon={faHourglassHalf}
      //     className="h-4 w-4 text-blue-500"
      //   />
      // ),
    },
    {
      label: "Income Gap",
      value:
        outputs.incomeGap <= 0
          ? `${formatCurrency(incomeGapAbs)} shortfall`
          : `${formatCurrency(incomeGapAbs)} surplus`,
      subline: `Target: ${formatCurrency(config.desiredMonthlyIncome)}/mo`,
      tone: onTrack ? ("good" as const) : ("danger" as const),
      // icon: (
      //   <FontAwesomeIcon
      //     icon={onTrack ? faArrowTrendUp : faArrowTrendDown}
      //     className={`h-4 w-4 ${onTrack ? "text-emerald-500" : "text-red-500"}`}
      //   />
      // ),
    },
  ];

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: faChartLine },
    { key: "simulator" as const, label: "Simulator", icon: faFlaskVial },
    { key: "insights" as const, label: "Insights", icon: faLightbulb },
  ];

  const mc = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };
  const mi = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="show"
        variants={mc}
        className="w-full"
      >
        <div className="mx-auto px-6 py-8 space-y-8">
          {/* ── Header ── */}
          <motion.div
            variants={mi}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
           
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Retirement
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Planning for age {config.retirementAge} ·{" "}
                    {outputs.yearsToRetirement} years away
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs gap-1.5 px-3 py-1 ${
                  onTrack
                    ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                    : "text-red-500 border-red-200 bg-red-50"
                }`}
              >
                <FontAwesomeIcon
                  icon={onTrack ? faArrowTrendUp : faArrowTrendDown}
                  className="h-3 w-3"
                />
                {onTrack ? "On track" : "Needs attention"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => setEditOpen(true)}
              >
                <FontAwesomeIcon icon={faPencil} className="h-3 w-3" />
                Edit plan
              </Button>
            </div>
          </motion.div>

          {/* ── KPI Strip ── */}
          <motion.div variants={mi}>
            <KpiStrip cols={4} items={kpiItems} />
          </motion.div>

          {/* ── Tabs ── */}
          <motion.div variants={mi}>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="h-3 w-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Projection Chart */}
                <div>
                  <SectionLabel>Wealth projection</SectionLabel>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Portfolio growth to retirement
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Age {currentAge} → {config.retirementAge} ·{" "}
                            {config.expectedReturnPct}% annual return assumed
                          </p>
                        </div>
                        <InfoTip content="Projection compounds your current balance plus monthly contributions at the assumed annual return rate. This is a model, not a guarantee." />
                      </div>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6 pt-2">
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart
                          data={projection}
                          margin={{ left: 16, right: 16, top: 8, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="balGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={NAVY}
                                stopOpacity={0.25}
                              />
                              <stop
                                offset="95%"
                                stopColor={NAVY}
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            strokeOpacity={0.1}
                          />
                          <XAxis
                            dataKey="age"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `Age ${v}`}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) =>
                              `$${(v / 1000000).toFixed(1)}M`
                            }
                            width={56}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <ReferenceLine
                            x={config.retirementAge}
                            stroke={AMBER}
                            strokeDasharray="4 3"
                            label={{
                              value: "Retire",
                              position: "top",
                              fontSize: 10,
                              fill: AMBER,
                            }}
                          />
                          <Area
                            dataKey="balance"
                            name="Portfolio balance"
                            stroke={NAVY}
                            strokeWidth={2}
                            fill="url(#balGrad)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress + Details grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Progress card */}
                  <Card className="lg:col-span-1">
                    <CardContent className="pt-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <FontAwesomeIcon
                            icon={faShieldHalved}
                            className="h-4 w-4 text-emerald-500"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            Savings progress
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {progressPct.toFixed(0)}% of target
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Progress value={progressPct} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(totalInvested)} today</span>
                          <span>
                            {formatCurrency(
                              outputs.projectedBalanceAtRetirement,
                            )}{" "}
                            target
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <StatRow
                        label="Current invested"
                        value={formatCurrency(config.currentInvested)}
                        tip="Value of your personal investment portfolio today."
                      />
                      <StatRow
                        label="Pension balance"
                        value={formatCurrency(config.existingPensionBalance)}
                        tip="Current balance in your pension or 401k."
                      />
                      <StatRow
                        label="Monthly contributions"
                        value={formatCurrency(totalMonthly)}
                        tip="Combined monthly amount going into investments and pension."
                      />
                      <StatRow
                        label="Contribution split"
                        value={`${Math.round((config.monthlySavings / totalMonthly) * 100)}% inv / ${Math.round((config.monthlyPensionContribution / totalMonthly) * 100)}% pension`}
                        tip="How your monthly contributions are split between personal investments and pension."
                      />
                    </CardContent>
                  </Card>

                  {/* Income & assumptions */}
                  <Card className="lg:col-span-2">
                    <CardContent className="pt-5 space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Retirement income
                          </p>
                          <StatRow
                            label="Desired income"
                            value={`${formatCurrency(config.desiredMonthlyIncome)}/mo`}
                            tip="Your target monthly income in retirement, in today's dollars."
                          />
                          <StatRow
                            label="Sustainable income"
                            value={`${formatCurrency(outputs.sustainableMonthlyIncome)}/mo`}
                            tip={`Calculated using the ${config.safeWithdrawalRatePct}% safe withdrawal rate on your projected balance.`}
                            valueClass={
                              onTrack ? "text-emerald-600" : "text-red-500"
                            }
                          />
                          <StatRow
                            label="Inflation-adjusted"
                            value={`${formatCurrency(outputs.inflationAdjustedSustainableMonthlyIncome)}/mo`}
                            tip="Your sustainable income adjusted for inflation over the years to retirement. This is the real purchasing power."
                          />
                          <StatRow
                            label={
                              gapDirection === "shortfall"
                                ? "Income shortfall"
                                : "Income surplus"
                            }
                            value={formatCurrency(incomeGapAbs) + "/mo"}
                            tip="Difference between your desired income and what your portfolio can sustainably provide."
                            valueClass={
                              onTrack ? "text-emerald-600" : "text-red-500"
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Assumptions
                          </p>
                          <StatRow
                            label="Expected return"
                            value={`${config.expectedReturnPct}%/yr`}
                            tip="Annual investment return assumed for the projection. Historical diversified portfolio average is ~7%."
                          />
                          <StatRow
                            label="Inflation rate"
                            value={`${config.inflationPct}%/yr`}
                            tip="Expected annual inflation used to adjust future purchasing power."
                          />
                          <StatRow
                            label="Safe withdrawal"
                            value={`${config.safeWithdrawalRatePct}%/yr`}
                            tip="The '4% rule' — percentage of portfolio withdrawn each year. Studies show this sustains a 30-year retirement."
                          />
                          <StatRow
                            label="Life expectancy"
                            value={`Age ${config.lifeExpectancy}`}
                            tip="Used to calculate how long your savings need to last in retirement."
                          />
                          <StatRow
                            label="Retirement duration"
                            value={`${config.lifeExpectancy - config.retirementAge} years`}
                            tip="How long your retirement savings need to fund your lifestyle."
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* On-track summary banner */}
                      <div
                        className={`rounded-lg px-4 py-3 flex items-start gap-3 ${
                          onTrack
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                            : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={onTrack ? faCircleCheck : faCircleExclamation}
                          className={`h-4 w-4 mt-0.5 shrink-0 ${onTrack ? "text-emerald-600" : "text-red-500"}`}
                        />
                        <div>
                          <p
                            className={`text-xs font-semibold ${onTrack ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}
                          >
                            {onTrack
                              ? `You're on track — projected surplus of ${formatCurrency(incomeGapAbs)}/mo`
                              : `Shortfall of ${formatCurrency(incomeGapAbs)}/mo at current trajectory`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {onTrack
                              ? `Your ${formatCurrency(totalMonthly)}/mo in contributions should grow to ${formatCurrency(outputs.projectedBalanceAtRetirement)} by age ${config.retirementAge}.`
                              : `Try increasing monthly contributions or adjusting your retirement age in the Simulator tab.`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "simulator" && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <SectionLabel>What-if simulator</SectionLabel>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faSliders}
                            className="h-4 w-4 text-primary"
                          />
                          Adjust the levers
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Slide to simulate changes — see the impact on your
                          retirement balance in real time
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <SimulatorPanel base={config} currentAge={currentAge} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <SectionLabel>Personalised insights</SectionLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((ins, i) => {
                      const cfg = {
                        good: {
                          bg: "bg-emerald-50 dark:bg-emerald-950/30",
                          border: "border-emerald-200 dark:border-emerald-800",
                          text: "text-emerald-700 dark:text-emerald-300",
                          iconColor: "text-emerald-500",
                        },
                        warning: {
                          bg: "bg-amber-50 dark:bg-amber-950/30",
                          border: "border-amber-200 dark:border-amber-800",
                          text: "text-amber-700 dark:text-amber-300",
                          iconColor: "text-amber-500",
                        },
                        danger: {
                          bg: "bg-red-50 dark:bg-red-950/30",
                          border: "border-red-200 dark:border-red-800",
                          text: "text-red-700 dark:text-red-400",
                          iconColor: "text-red-500",
                        },
                        info: {
                          bg: "bg-blue-50 dark:bg-blue-950/30",
                          border: "border-blue-200 dark:border-blue-800",
                          text: "text-blue-700 dark:text-blue-300",
                          iconColor: "text-blue-500",
                        },
                      }[ins.level];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`rounded-lg border p-4 ${cfg.bg} ${cfg.border}`}
                        >
                          <div className="flex items-start gap-3">
                            <FontAwesomeIcon
                              icon={ins.icon}
                              className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.iconColor}`}
                            />
                            <div>
                              <p
                                className={`text-xs font-semibold ${cfg.text}`}
                              >
                                {ins.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {ins.body}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Key numbers recap */}
                <div>
                  <SectionLabel>Key numbers at a glance</SectionLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        icon: faCalendarDays,
                        label: "Current Age",
                        value: `${currentAge}`,
                        color: "text-blue-500",
                        bg: "bg-blue-500/10",
                      },
                      {
                        icon: faUserClock,
                        label: "Retirement Age",
                        value: `${config.retirementAge}`,
                        color: "text-amber-500",
                        bg: "bg-amber-500/10",
                      },
                      {
                        icon: faSackDollar,
                        label: "Total Contributions",
                        value: formatCurrency(totalInvested),
                        color: "text-emerald-500",
                        bg: "bg-emerald-500/10",
                      },
                      {
                        icon: faChartLine,
                        label: "Projected Balance",
                        value: formatCurrency(
                          outputs.projectedBalanceAtRetirement,
                        ),
                        color: NAVY.startsWith("#")
                          ? undefined
                          : "text-primary",
                        bg: "bg-primary/10",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.07 }}
                      >
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div
                              className={`p-2 rounded-lg w-fit mb-2 ${item.bg}`}
                            >
                              <FontAwesomeIcon
                                icon={item.icon}
                                className={`h-4 w-4 ${item.color}`}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.label}
                            </p>
                            <p className="text-sm font-bold mt-0.5 tabular-nums">
                              {item.value}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Simulator CTA */}
                <Card className="border-dashed">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FontAwesomeIcon
                            icon={faFlaskVial}
                            className="h-4 w-4 text-primary"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            Try the simulator
                          </p>
                          <p className="text-xs text-muted-foreground">
                            See how changing your retirement age or
                            contributions affects the outcome
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="gap-1.5 shrink-0"
                        onClick={() => setActiveTab("simulator")}
                      >
                        <FontAwesomeIcon icon={faSliders} className="h-3 w-3" />
                        Open simulator
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit Dialog */}
        <EditRetirementDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          config={config}
          onSave={setConfig}
        />
      </motion.div>
    </TooltipProvider>
  );
}
