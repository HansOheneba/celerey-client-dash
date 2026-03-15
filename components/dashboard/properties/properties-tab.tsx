"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { KpiStrip, type KpiItem } from "@/components/dashboard/kpi-strip";
import { PropertyRow } from "@/components/dashboard/properties/property-row";
import { PropertyAnalysis } from "@/components/dashboard/properties/property-analysis";
import AssetMap from "@/components/dashboard/properties/country-chart";
import { CountryDonutChart } from "./country-value-chart";

import {
  mockProperties,
  propertyEquity,
  propertyLvr,
  totalInsurancePremium,
  totalInsuranceCoverage,
  totalPropertyLienBalance,
  getPropertyGeoCountries,
  isInsuranceExpiringSoon,
  isInsuranceExpired,
  propertyInsuranceTypeLabel,
  formatCurrency,
} from "@/lib/client-data";

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

// ─── Insurance summary — read-only, all actions link to insurance tab ──────

function PropertyInsuranceSummary({
  properties,
}: {
  properties: ReturnType<typeof mockProperties.filter>;
}) {
  const allPolicies = properties.flatMap((p) =>
    p.insurance.map((ins) => ({
      ...ins,
      propertyName: p.name,
      propertyId: p.property_id,
    })),
  );

  const totalPremiums = sum(properties.map((p) => totalInsurancePremium(p)));
  const totalCoverage = sum(properties.map((p) => totalInsuranceCoverage(p)));
  const expired = allPolicies.filter((p) => isInsuranceExpired(p));
  const expiringSoon = allPolicies.filter(
    (p) => isInsuranceExpiringSoon(p) && !isInsuranceExpired(p),
  );
  const uninsured = properties.filter((p) => p.insurance.length === 0);
  const hasAlerts =
    expired.length > 0 || expiringSoon.length > 0 || uninsured.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Property Insurance</CardTitle>
         
        </div>
        <p className="text-xs text-muted-foreground">
          Coverage across your holdings. Add or edit in the{" "}
          <Link
            href="/dashboard/insurance"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Insurance tab
          </Link>
          .
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Policies
            </p>
            <p className="text-lg font-bold tabular-nums">
              {allPolicies.length}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Across {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total Coverage
            </p>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(totalCoverage)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Combined insured value
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Annual Premium
            </p>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(totalPremiums)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatCurrency(Math.round(totalPremiums / 12))}/mo
            </p>
          </div>
        </div>

        <Separator />

        {hasAlerts && (
          <div className="space-y-2">
            {uninsured.map((prop) => (
              <div
                key={prop.property_id}
                className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-medium">{prop.name}</span> has no
                  insurance.{" "}
                  <Link
                    href="/dashboard/insurance"
                    className="underline underline-offset-2"
                  >
                    Add a policy
                  </Link>
                </p>
              </div>
            ))}
            {expired.map((pol, i) => (
              <div
                key={`exp-${i}`}
                className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300">
                  <span className="font-medium">{pol.propertyName}</span> —{" "}
                  {propertyInsuranceTypeLabel(pol.insurance_type)} expired{" "}
                  {new Date(pol.expiry_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  .{" "}
                  <Link
                    href="/dashboard/insurance"
                    className="underline underline-offset-2"
                  >
                    Renew now
                  </Link>
                </p>
              </div>
            ))}
            {expiringSoon.map((pol, i) => (
              <div
                key={`soon-${i}`}
                className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-medium">{pol.propertyName}</span> —{" "}
                  {propertyInsuranceTypeLabel(pol.insurance_type)} expires{" "}
                  {new Date(pol.expiry_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  .{" "}
                  <Link
                    href="/dashboard/insurance"
                    className="underline underline-offset-2"
                  >
                    Review
                  </Link>
                </p>
              </div>
            ))}
          </div>
        )}

        {!hasAlerts && allPolicies.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              All properties are insured with current policies.
            </p>
          </div>
        )}

        {allPolicies.length > 0 && (
          <div className="space-y-2.5">
            {properties
              .filter((p) => p.insurance.length > 0)
              .map((prop) => {
                const propExpired = prop.insurance.some(isInsuranceExpired);
                const propSoon = prop.insurance.some(
                  (i) => isInsuranceExpiringSoon(i) && !isInsuranceExpired(i),
                );
                return (
                  <div
                    key={prop.property_id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {prop.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {prop.insurance
                          .map((i) =>
                            propertyInsuranceTypeLabel(i.insurance_type),
                          )
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {propExpired && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 text-red-600 border-red-200 bg-red-50"
                        >
                          Expired
                        </Badge>
                      )}
                      {propSoon && !propExpired && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-200 bg-amber-50"
                        >
                          Expiring
                        </Badge>
                      )}
                      <span className="text-xs font-medium tabular-nums">
                        {formatCurrency(totalInsurancePremium(prop))}/yr
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {allPolicies.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">
              No property insurance recorded.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              asChild
            >
              <Link href="/dashboard/insurance">
                <Plus className="h-3 w-3" /> Add insurance
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main tab ──────────────────────────────────────────────────────────────

export function PropertiesTab() {
  const properties = mockProperties.filter((p) => p.is_active);

  const totalPropertyValue = React.useMemo(
    () => sum(properties.map((p) => p.market_value)),
    [properties],
  );
  const totalEquity = React.useMemo(
    () => sum(properties.map((p) => propertyEquity(p))),
    [properties],
  );
  const outstandingLoans = React.useMemo(
    () => sum(properties.map((p) => totalPropertyLienBalance(p))),
    [properties],
  );
  const avgLvr = React.useMemo(() => {
    if (!properties.length) return 0;
    return Math.round(
      properties.reduce((s, p) => s + propertyLvr(p), 0) / properties.length,
    );
  }, [properties]);
  const totalInsuranceCost = React.useMemo(
    () => sum(properties.map((p) => totalInsurancePremium(p))),
    [properties],
  );
  const equityRatioPct =
    totalPropertyValue > 0
      ? Math.round((totalEquity / totalPropertyValue) * 100)
      : 0;

  const kpiItems: KpiItem[] = [
    {
      label: "Total Value",
      value: formatCurrency(totalPropertyValue),
      subline: `${properties.length} active ${properties.length === 1 ? "property" : "properties"}`,
      tone: "neutral",
    },
    {
      label: "Total Equity",
      value: formatCurrency(totalEquity),
      subline: `${equityRatioPct}% of total value`,
      tone: totalEquity >= 0 ? "good" : "danger",
    },
    {
      label: "Outstanding Loans",
      value: formatCurrency(outstandingLoans),
      subline: "Mortgages and liens",
      tone: "neutral",
    },
    {
      label: "Avg LVR",
      value: `${avgLvr}%`,
      subline:
        avgLvr > 80
          ? "High leverage"
          : avgLvr > 60
            ? "Moderate leverage"
            : "Healthy range",
      tone: avgLvr > 80 ? "danger" : avgLvr > 60 ? "warning" : "good",
    },
    {
      label: "Insurance Cost",
      value: formatCurrency(totalInsuranceCost),
      subline: `${formatCurrency(Math.round(totalInsuranceCost / 12))}/mo combined`,
      tone: "neutral",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <KpiStrip items={kpiItems} cols={5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AssetMap
            countries={getPropertyGeoCountries(properties)}
            propertyCount={properties.length}
          />
          <CountryDonutChart />
      <PropertyAnalysis />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight">
              Your Properties
            </h2>
            <p className="text-xs text-muted-foreground">
              Breakdown of each real estate holding.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/dashboard/properties/new">
              <Plus className="h-3.5 w-3.5" /> Add property
            </Link>
          </Button>
        </div>
        <div className="space-y-3">
          {properties.map((p) => (
            <PropertyRow key={p.property_id} property={p} />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <SectionLabel>Equity breakdown</SectionLabel>
        <Card>
          <CardContent className="pt-5 space-y-3">
            {properties.map((p) => {
              const eq = propertyEquity(p);
              const pct =
                p.market_value > 0
                  ? Math.round((eq / p.market_value) * 100)
                  : 0;
              return (
                <div key={p.property_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{p.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-muted-foreground">
                        {pct}% equity
                      </span>
                      <span
                        className={`font-medium tabular-nums ${eq >= 0 ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {formatCurrency(eq)}
                      </span>
                    </div>
                  </div>
                  <Progress value={Math.max(pct, 0)} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionLabel>Insurance</SectionLabel>
        <PropertyInsuranceSummary properties={properties} />
      </motion.div>

    </motion.div>
  );
}
