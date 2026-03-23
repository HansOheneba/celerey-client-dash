"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CashFlowPoint, formatCurrency } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

// ─── Same colors as overview page ────────────────────────────────────────────
const INCOME_COLOR = "#1e3a5f"; // deep navy blue
const EXPENSES_COLOR = "#7eb8e8"; // light blue

const chartConfig = {
  income: { label: "Income", color: INCOME_COLOR },
  expenses: { label: "Expenses", color: EXPENSES_COLOR },
} satisfies ChartConfig;

// ─── Enriched point type ──────────────────────────────────────────────────────
type EnrichedPoint = CashFlowPoint & { isProjected?: boolean; label: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function addMonths(base: Date, offset: number): string {
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function toLabel(isoMonth: string): string {
  return new Date(isoMonth + "-01").toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CashFlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const incomeValue: number | undefined =
    payload.find((p: any) => p.dataKey === "income" && p.value != null)
      ?.value ??
    payload.find((p: any) => p.dataKey === "projIncome" && p.value != null)
      ?.value;
  const expensesValue: number | undefined =
    payload.find((p: any) => p.dataKey === "expenses" && p.value != null)
      ?.value ??
    payload.find((p: any) => p.dataKey === "projExpenses" && p.value != null)
      ?.value;
  const isProjected: boolean =
    payload.some((p: any) => p.dataKey === "projIncome" && p.value != null) &&
    !payload.some((p: any) => p.dataKey === "income" && p.value != null);

  return (
    <div className="rounded-lg border bg-background shadow-md px-3 py-2.5 text-xs space-y-1.5 min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">
        {label}
        {isProjected && (
          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
            (projected)
          </span>
        )}
      </p>
      {incomeValue != null && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: INCOME_COLOR }}
            />
            <span className="text-muted-foreground">Income</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(incomeValue)}
          </span>
        </div>
      )}
      {expensesValue != null && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: EXPENSES_COLOR }}
            />
            <span className="text-muted-foreground">Expenses</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(expensesValue)}
          </span>
        </div>
      )}
    </div>
  );
}

interface CashFlowChartProps {
  data: CashFlowPoint[];
  title?: string;
  description?: string;
  className?: string;
}

export function CashFlowChart({
  data,
  title = "Income vs Expenses",
  description = "Cash flow over time",
  className,
}: CashFlowChartProps) {
  const [timeRange, setTimeRange] = React.useState("12m");

  const incomeRows = useFinancialStore((s) => s.incomeRows);
  const expenseCategories = useFinancialStore((s) => s.expenseCategories);

  const monthlyIncome = React.useMemo(
    () => incomeRows.reduce((s, i) => s + i.amount, 0),
    [incomeRows],
  );
  const monthlyExpenses = React.useMemo(
    () => expenseCategories.reduce((s, e) => s + e.amount, 0),
    [expenseCategories],
  );

  // ── Build merged actual + projected dataset ──────────────────────────────
  const mergedData = React.useMemo<EnrichedPoint[]>(() => {
    const today = new Date();
    const actualSet = new Set(data.map((d) => d.month));

    const actual: EnrichedPoint[] = [...data]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((p) => ({ ...p, isProjected: false, label: toLabel(p.month) }));

    const variance = (i: number, base: number): number =>
      base + base * 0.03 * Math.sin(i * 0.8);

    const projected: EnrichedPoint[] = Array.from({ length: 12 }, (_, i) => {
      const month = addMonths(today, i);
      return {
        month,
        income: variance(i, monthlyIncome),
        expenses: variance(i, monthlyExpenses),
        isProjected: true,
        label: toLabel(month),
      };
    }).filter((p) => !actualSet.has(p.month));

    return [...actual, ...projected].sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }, [data, monthlyIncome, monthlyExpenses]);

  // ── Filter by time range ─────────────────────────────────────────────────
  const filteredData = React.useMemo<EnrichedPoint[]>(() => {
    if (timeRange === "12m-forward") {
      return mergedData.filter((p) => p.isProjected);
    }
    const historical = mergedData.filter((p) => !p.isProjected);
    const projected = mergedData.filter((p) => p.isProjected);
    const sliced =
      timeRange === "3m"
        ? historical.slice(-3)
        : timeRange === "6m"
          ? historical.slice(-6)
          : historical.slice(-12);
    return [...sliced, ...projected].sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }, [mergedData, timeRange]);

  const todayMonthLabel = React.useMemo(
    () => toLabel(addMonths(new Date(), 0)),
    [],
  );

  const yMax = React.useMemo(() => {
    const max = Math.max(
      0,
      ...filteredData.flatMap((d) => [d.income, d.expenses]),
    );
    return Math.ceil((max * 1.2) / 1000) * 1000 || 10000;
  }, [filteredData]);

  // ── Chart data with split actual / projected keys ────────────────────────
  const chartData = React.useMemo(() => {
    const lastActualIdx = filteredData.reduce<number>(
      (last, p, i) => (!p.isProjected ? i : last),
      -1,
    );
    return filteredData.map((p, i) => ({
      label: p.label,
      month: p.month,
      income: p.isProjected ? null : p.income,
      expenses: p.isProjected ? null : p.expenses,
      projIncome: p.isProjected || i === lastActualIdx ? p.income : null,
      projExpenses: p.isProjected || i === lastActualIdx ? p.expenses : null,
    }));
  }, [filteredData]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (monthlyIncome === 0 && monthlyExpenses === 0 && data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Set up your income and expenses to see your projected cash flow.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-44 rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 12 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="12m" className="rounded-lg">
              Last 12 months
            </SelectItem>
            <SelectItem value="6m" className="rounded-lg">
              Last 6 months
            </SelectItem>
            <SelectItem value="3m" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="12m-forward" className="rounded-lg">
              12m forward
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Inline legend */}
        <div className="flex items-center gap-4 mb-3 px-1 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2 w-6 rounded-full"
              style={{ backgroundColor: INCOME_COLOR }}
            />
            Income
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2 w-6 rounded-full"
              style={{ backgroundColor: EXPENSES_COLOR }}
            />
            Expenses
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg width="24" height="8" className="overflow-visible">
              <line
                x1="0"
                y1="4"
                x2="24"
                y2="4"
                stroke={INCOME_COLOR}
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.55"
              />
            </svg>
            Projected
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => formatCurrency(value)}
              width={80}
              domain={[0, yMax]}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip cursor={false} content={<CashFlowTooltip />} />
            {/* Today reference line */}
            <ReferenceLine
              x={todayMonthLabel}
              stroke={INCOME_COLOR}
              strokeOpacity={0.3}
              strokeDasharray="4 3"
              label={{
                value: "Today",
                position: "top",
                offset: 10,
                fontSize: 10,
                fill: "var(--muted-foreground)",
              }}
            />
            {/* Actual data lines */}
            <Line
              dataKey="income"
              type="monotone"
              stroke={INCOME_COLOR}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              dataKey="expenses"
              type="monotone"
              stroke={EXPENSES_COLOR}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            {/* Projected lines — dashed */}
            <Line
              dataKey="projIncome"
              type="monotone"
              stroke={INCOME_COLOR}
              strokeWidth={2}
              strokeDasharray="4 3"
              strokeOpacity={0.55}
              dot={false}
              connectNulls
              legendType="none"
            />
            <Line
              dataKey="projExpenses"
              type="monotone"
              stroke={EXPENSES_COLOR}
              strokeWidth={2}
              strokeDasharray="4 3"
              strokeOpacity={0.55}
              dot={false}
              connectNulls
              legendType="none"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
