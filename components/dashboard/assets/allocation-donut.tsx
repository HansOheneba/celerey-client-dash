"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

function donutTooltipFormatter(value: unknown): string {
  const v = typeof value === "number" ? value : 0;
  return formatCurrency(v);
}

export function AllocationDonut({
  data,
  title,
  centerLabel,
}: {
  data: { label: string; value: number }[];
  title: string;
  centerLabel: string;
}) {
  const total = sum(data.map((d) => d.value));

  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={donutTooltipFormatter} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label overlay */}
          <div className="pointer-events-none -mt-56 flex h-56 items-center justify-center">
            <div className="rounded-full bg-background/70 px-4 py-2 text-center backdrop-blur">
              <div className="text-xs text-muted-foreground">{centerLabel}</div>
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(total)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((d) => (
            <div
              key={d.label}
              className="flex items-center justify-between gap-4"
            >
              <div className="text-sm text-muted-foreground">{d.label}</div>
              <div className="flex items-center gap-6">
                <div className="text-sm font-medium tabular-nums">
                  {formatCurrency(d.value)}
                </div>
                <div className="w-12 text-right text-sm text-muted-foreground tabular-nums">
                  {Math.round(pct(d.value, total))}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
