"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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

// ─── Same colors as overview page ────────────────────────────────────────────
const INCOME_COLOR = "#1e3a5f"; // deep navy blue
const EXPENSES_COLOR = "#7eb8e8"; // light blue

const chartConfig = {
  income: { label: "Income", color: INCOME_COLOR },
  expenses: { label: "Expenses", color: EXPENSES_COLOR },
} satisfies ChartConfig;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CashFlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const income = payload.find((p: any) => p.dataKey === "income");
  const expenses = payload.find((p: any) => p.dataKey === "expenses");

  return (
    <div className="rounded-lg border bg-background shadow-md px-3 py-2.5 text-xs space-y-1.5 min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {income && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: INCOME_COLOR }}
            />
            <span className="text-muted-foreground">Income</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(income.value)}
          </span>
        </div>
      )}
      {expenses && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: EXPENSES_COLOR }}
            />
            <span className="text-muted-foreground">Expenses</span>
          </div>
          <span className="font-medium text-foreground">
            {formatCurrency(expenses.value)}
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

  const filteredData = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));
    if (timeRange === "3m") return sorted.slice(-3);
    if (timeRange === "6m") return sorted.slice(-6);
    return sorted.slice(-12);
  }, [data, timeRange]);

  const yMax = React.useMemo(() => {
    const max = Math.max(
      ...filteredData.flatMap((d) => [d.income, d.expenses]),
    );
    return Math.ceil(max / 10000) * 10000;
  }, [filteredData]);

  const formattedData = filteredData.map((point) => ({
    ...point,
    label: new Date(point.month + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
  }));

  return (
    <Card className={className}>
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
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
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Inline legend — matches overview page style */}
        <div className="flex items-center gap-4 mb-3 px-1">
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
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart data={formattedData} margin={{ left: 12, right: 12 }}>
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
              tickFormatter={(value) => formatCurrency(value)}
              width={80}
              domain={[0, yMax]}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip cursor={false} content={<CashFlowTooltip />} />
            <Line
              dataKey="income"
              type="monotone"
              stroke={INCOME_COLOR}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expenses"
              type="monotone"
              stroke={EXPENSES_COLOR}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
