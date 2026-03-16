"use client";

import { LabelList, Pie, PieChart } from "recharts";

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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { mockProperties, formatCurrency } from "@/lib/client-data";

// ─── Brand palette — navy shades for slices ───────────────────────────────────

const SLICE_COLORS = [
  "#151339",
  "#1e3a5f",
  "#2d5282",
  "#3b6cb5",
  "#7eb8e8",
  "#a8d4f5",
  "#c3e2fa",
  "#daeffe",
  "#1a2a4a",
  "#243d6b",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type PropertySlice = {
  key: string;
  name: string;
  marketValue: number;
  fill: string;
};

function getTopProperties(
  properties: typeof mockProperties,
  limit = 10,
): PropertySlice[] {
  return [...properties]
    .filter((p) => p.is_active && p.market_value > 0)
    .sort((a, b) => b.market_value - a.market_value)
    .slice(0, limit)
    .map((p, i) => ({
      key: p.property_id,
      name: p.name,
      marketValue: p.market_value,
      fill: SLICE_COLORS[i % SLICE_COLORS.length],
    }));
}

function buildChartConfig(slices: PropertySlice[]): ChartConfig {
  const config: ChartConfig = {
    marketValue: { label: "Market Value" },
  };
  slices.forEach((s) => {
    config[s.key] = { label: s.name, color: s.fill };
  });
  return config;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CountryDonutChart() {
  const activeProps = mockProperties.filter((p) => p.is_active);
  // Show top 5 if 7 or fewer properties, otherwise top 10
  const limit = Math.min(activeProps.length, 10);
  const slices = getTopProperties(activeProps, limit);
  const chartConfig = buildChartConfig(slices);
  const totalValue = slices.reduce((s, p) => s + p.marketValue, 0);
  const hiddenCount = activeProps.length - slices.length;

  // recharts needs the dataKey to match a field on the object
  const chartData = slices.map((s) => ({
    ...s,
    // LabelList formatter uses this key to look up chartConfig
    configKey: s.key,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Property Value Distribution</CardTitle>
        <CardDescription>
          Top {slices.length} properties by market value
          {hiddenCount > 0 && ` · ${hiddenCount} more not shown`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  hideLabel
                  formatter={(value, name, item) => [
                    formatCurrency(Number(value)),
                    item.payload.name,
                  ]}
                />
              }
            />
            <Pie data={chartData} dataKey="marketValue" nameKey="name">
              <LabelList
                dataKey="configKey"
                className="fill-background"
                stroke="none"
                fontSize={11}
                formatter={(value: string) =>
                  chartConfig[value]?.label ?? value
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      {/* Legend */}
      <div className="px-6 pb-5 pt-2 space-y-1.5">
        {slices.map((s) => {
          const pct = totalValue > 0 ? (s.marketValue / totalValue) * 100 : 0;
          return (
            <div
              key={s.key}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.fill }}
                />
                <span className="text-muted-foreground truncate max-w-[160px]">
                  {s.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-muted-foreground">{pct.toFixed(1)}%</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(s.marketValue)}
                </span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between text-xs pt-1 border-t mt-1">
          <span className="text-muted-foreground font-medium">Total</span>
          <span className="font-bold tabular-nums">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </div>
    </Card>
  );
}
