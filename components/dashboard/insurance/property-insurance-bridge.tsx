"use client";

import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type InsurancePolicy,
  policyStatus,
  categoryLabel,
  statusLabel,
} from "@/lib/insurance-data";
import {
  type Property,
  totalInsurancePremium,
  totalInsuranceCoverage,
  isInsuranceExpiringSoon,
  isInsuranceExpired,
  insuranceTypeLabel,
} from "@/lib/property-data";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PropertyInsuranceBridge({
  properties,
}: {
  properties: Property[];
}) {
  const allPropertyPolicies = properties.flatMap((p) =>
    p.insurance.map((ins) => ({ ...ins, propertyName: p.name })),
  );

  const totalPropPremiums = properties.reduce(
    (s, p) => s + totalInsurancePremium(p),
    0,
  );
  const totalPropCoverage = properties.reduce(
    (s, p) => s + totalInsuranceCoverage(p),
    0,
  );

  const expiringSoon = allPropertyPolicies.filter(
    (p) => isInsuranceExpiringSoon(p) && !isInsuranceExpired(p),
  );
  const expired = allPropertyPolicies.filter((p) => isInsuranceExpired(p));
  const uninsured = properties.filter((p) => p.insurance.length === 0);

  const hasAlerts =
    uninsured.length > 0 || expiringSoon.length > 0 || expired.length > 0;

  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Property Insurance</CardTitle>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/dashboard/properties">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Manage in Properties
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Insurance on your real estate holdings. Managed per-property.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">Policies</div>
            <div className="text-lg font-semibold tabular-nums">
              {allPropertyPolicies.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Coverage</div>
            <div className="text-lg font-semibold tabular-nums">
              {formatCurrency(totalPropCoverage)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Annual Premiums</div>
            <div className="text-lg font-semibold tabular-nums">
              {formatCurrency(totalPropPremiums)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Properties</div>
            <div className="text-lg font-semibold tabular-nums">
              {properties.length}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {hasAlerts && (
          <div className="space-y-2">
            {uninsured.map((prop) => (
              <div
                key={prop.property_id}
                className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-400">
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {prop.name}
                  </span>{" "}
                  has no insurance coverage.
                </span>
              </div>
            ))}

            {expired.map((pol, i) => (
              <div
                key={`exp-${i}`}
                className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="text-rose-700 dark:text-rose-400">
                  <span className="font-medium text-rose-800 dark:text-rose-300">
                    {pol.propertyName}
                  </span>{" "}
                  — {insuranceTypeLabel(pol.insurance_type)} expired{" "}
                  {formatDate(pol.expiry_date)}.
                </span>
              </div>
            ))}

            {expiringSoon.map((pol, i) => (
              <div
                key={`warn-${i}`}
                className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-400">
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {pol.propertyName}
                  </span>{" "}
                  — {insuranceTypeLabel(pol.insurance_type)} expires{" "}
                  {formatDate(pol.expiry_date)}.
                </span>
              </div>
            ))}
          </div>
        )}

        {!hasAlerts && allPropertyPolicies.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            All properties are insured with current policies.
          </div>
        )}

        {/* Per-property breakdown */}
        {allPropertyPolicies.length > 0 && (
          <div className="divide-y divide-muted/40">
            {properties
              .filter((p) => p.insurance.length > 0)
              .map((prop) => (
                <div
                  key={prop.property_id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <div className="text-sm font-medium">{prop.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {prop.insurance
                        .map((i) => insuranceTypeLabel(i.insurance_type))
                        .join(", ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {formatCurrency(totalInsuranceCoverage(prop))}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(totalInsurancePremium(prop))}/yr
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
