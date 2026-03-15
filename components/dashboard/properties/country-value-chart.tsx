"use client";

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";

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

import { mockProperties } from "@/lib/client-data";

type CountryStats = {
  country: string;
  count: number;
  totalValue: number;
};

const BLUE = "#151339";

/* ---------------------------------- */
/* Build country stats                */
/* ---------------------------------- */

function getCountryStats(properties: typeof mockProperties): CountryStats[] {
  const stats: Record<string, CountryStats> = {};

  for (const p of properties) {
    if (!p.is_active) continue;

    if (!stats[p.country]) {
      stats[p.country] = {
        country: p.country,
        count: 0,
        totalValue: 0,
      };
    }

    stats[p.country].count += 1;
    stats[p.country].totalValue += p.market_value;
  }

  return Object.values(stats)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);
}

function buildConfig(data: CountryStats[]): ChartConfig {
  const config: ChartConfig = {
    totalValue: { label: "Property Value" },
  };

  data.forEach(({ country }) => {
    config[country] = {
      label: country,
      color: BLUE,
    };
  });

  return config;
}

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */

export function CountryDonutChart() {
  const data = getCountryStats(mockProperties);

  const chartConfig = buildConfig(data);

  const chartData = data.map((d) => ({
    country: d.country,
    totalValue: d.totalValue,
    count: d.count,
    fill: BLUE,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Top Countries by Property Value</CardTitle>
        <CardDescription>
          Active holdings ranked by total property value
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <ChartContainer config={chartConfig} className="w-full h-[180px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            barSize={28}
            margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
          >
            <XAxis type="number" dataKey="totalValue" hide />

            <YAxis
              dataKey="country"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={110}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "totalValue") {
                      return [
                        `$${Number(value).toLocaleString()}`,
                        "Total Value",
                      ];
                    }
                    return value;
                  }}
                />
              }
            />

            <Bar dataKey="totalValue" radius={6}>
              {chartData.map((entry) => (
                <Cell key={entry.country} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
