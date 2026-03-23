"use client";

import { useState, useEffect, useRef } from "react";
import { DashCard } from "@/components/dashboard/dash-card";
import { formatCurrency, type Property } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

// ─── Brand color axis ─────────────────────────────────────────────────────────
const COLOR_MIN = "#a8d4f5";
const COLOR_MAX = "#151339";

// ─── Google GeoChart needs specific country name formats ──────────────────────
// Map your lib's country codes to what Google GeoChart actually recognises
const GEO_COUNTRY_MAP: Record<string, string> = {
  USA: "United States",
  UK: "United Kingdom",
  Australia: "Australia",
  Canada: "Canada",
  Ghana: "Ghana",
  Nigeria: "Nigeria",
  "South Africa": "South Africa",
  UAE: "United Arab Emirates",
  Singapore: "Singapore",
  Germany: "Germany",
  France: "France",
  Netherlands: "Netherlands",
  Switzerland: "Switzerland",
  Japan: "Japan",
  Thailand: "Thailand",
  // Pass-through for anything already fully named
};

function resolveGeoName(country: string): string {
  return GEO_COUNTRY_MAP[country] ?? country;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CountryStat = {
  geoName: string;
  displayName: string;
  totalValue: number;
  propertyCount: number;
};

function buildCountryStats(properties: Property[]): CountryStat[] {
  const map = new Map<string, CountryStat>();

  for (const p of properties) {
    if (!p.is_active) continue;
    const geoName = resolveGeoName(p.country);
    const displayName = p.country;
    const existing = map.get(geoName);
    if (existing) {
      existing.totalValue += p.market_value;
      existing.propertyCount += 1;
    } else {
      map.set(geoName, {
        geoName,
        displayName,
        totalValue: p.market_value,
        propertyCount: 1,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.totalValue - a.totalValue);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssetMap({
  countries,
  propertyCount,
}: {
  countries: string[];
  propertyCount: number;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const storeProperties = useFinancialStore((s) => s.propertyAssets);
  const activeProps = storeProperties.filter((p) => p.is_active);
  const countryStats = buildCountryStats(activeProps);

  // ── Load Google Charts with API key ──────────────────────────────────────

  useEffect(() => {
    if (
      typeof (window as any).google?.visualization?.GeoChart !== "undefined"
    ) {
      setReady(true);
      return;
    }

    const existingScript = document.getElementById("google-charts-loader");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-charts-loader";
      script.src = "https://www.gstatic.com/charts/loader.js";
      script.async = true;
      script.onload = () => {
        (window as any).google.charts.load("current", {
          packages: ["geochart"],
          // Required for region mode with full country name geocoding
          mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "",
        });
        (window as any).google.charts.setOnLoadCallback(() => setReady(true));
      };
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (
          typeof (window as any).google?.visualization?.GeoChart !== "undefined"
        ) {
          setReady(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // ── Draw chart ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!ready || !chartRef.current || countryStats.length === 0) return;

    const google = (window as any).google;

    const data = new google.visualization.DataTable();
    data.addColumn("string", "Country");
    data.addColumn("number", "Total Value");
    data.addColumn({
      type: "string",
      role: "tooltip",
      p: { html: true },
    });

    countryStats.forEach((stat) => {
      const tooltip = `
        <div style="
          padding: 10px 14px;
          font-family: sans-serif;
          font-size: 12px;
          min-width: 180px;
          line-height: 1.7;
        ">
          <strong style="font-size: 13px; display: block; margin-bottom: 4px;">
            ${stat.displayName}
          </strong>
          <span style="color: #666;">
            ${stat.propertyCount} ${stat.propertyCount === 1 ? "property" : "properties"}
          </span><br/>
          <span style="color: #151339; font-weight: 600;">
            ${formatCurrency(stat.totalValue)}
          </span>
        </div>
      `;
      data.addRow([stat.geoName, stat.totalValue, tooltip]);
    });

    const options = {
      region: "world",
      displayMode: "regions",
      datalessRegionColor: "#eef0f3",
      backgroundColor: { fill: "transparent", strokeWidth: 0 },
      colorAxis: { colors: [COLOR_MIN, COLOR_MAX] },
      legend: "none",
      tooltip: { isHtml: true, trigger: "focus" },
      enableRegionInteractivity: true,
      keepAspectRatio: true,
    };

    const chart = new google.visualization.GeoChart(chartRef.current);
    chart.draw(data, options);

    const observer = new ResizeObserver(() => chart.draw(data, options));
    observer.observe(chartRef.current!);
    return () => observer.disconnect();
  }, [ready, countryStats]);

  return (
    <DashCard className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-medium text-gray-900">Geographic Spread</h2>
      </div>

      {/* Map */}
      {!ready ? (
        <div className="w-full h-[260px] flex items-center justify-center text-xs text-gray-400 animate-pulse">
          Loading map...
        </div>
      ) : (
        <div ref={chartRef} className="w-full" style={{ height: 260 }} />
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
        <div
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ backgroundColor: COLOR_MAX }}
        />
        You have {propertyCount}{" "}
        {propertyCount === 1 ? "property" : "properties"} across{" "}
        {countries.length} {countries.length === 1 ? "country" : "countries"}
      </div>
    </DashCard>
  );
}
