"use client";

import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Property,
  totalInsurancePremium,
  totalInsuranceCoverage,
  isInsuranceExpiringSoon,
  isInsuranceExpired,
  insuranceTypeLabel,
} from "@/lib/property-data";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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

export function InsuranceSummaryCard({
  properties,
}: {
  properties: Property[];
}) {
  const allPolicies = properties.flatMap((p) =>
    p.insurance.map((ins) => ({ ...ins, propertyName: p.name })),
  );

  const totalPremiums = properties.reduce(
    (s, p) => s + totalInsurancePremium(p),
    0,
  );
  const totalCoverage = properties.reduce(
    (s, p) => s + totalInsuranceCoverage(p),
    0,
  );

  const expiringSoon = allPolicies.filter(
    (p) => isInsuranceExpiringSoon(p) && !isInsuranceExpired(p),
  );
  const expired = allPolicies.filter((p) => isInsuranceExpired(p));
  const uninsured = properties.filter((p) => p.insurance.length === 0);

  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Insurance Overview</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Property insurance coverage across your portfolio.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Top-level stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Policies</div>
            <div className="text-lg font-semibold tabular-nums">
              {allPolicies.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Coverage</div>
            <div className="text-lg font-semibold tabular-nums">
              {formatCurrency(totalCoverage)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Annual Premiums</div>
            <div className="text-lg font-semibold tabular-nums">
              {formatCurrency(totalPremiums)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Monthly Cost</div>
            <div className="text-lg font-semibold tabular-nums">
              {formatCurrency(Math.round(totalPremiums / 12))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(uninsured.length > 0 ||
          expiringSoon.length > 0 ||
          expired.length > 0) && (
          <div className="space-y-2">
            {uninsured.map((prop) => (
              <div
                key={prop.property_id}
                className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {prop.name}
                  </span>{" "}
                  <span className="text-amber-700 dark:text-amber-400">
                    has no insurance coverage. Consider adding a policy.
                  </span>
                </div>
              </div>
            ))}

            {expired.map((pol, i) => (
              <div
                key={`exp-${i}`}
                className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <div>
                  <span className="font-medium text-rose-800 dark:text-rose-300">
                    {pol.propertyName}
                  </span>{" "}
                  <span className="text-rose-700 dark:text-rose-400">
                    — {insuranceTypeLabel(pol.insurance_type)} policy from{" "}
                    {pol.provider} expired on {formatDate(pol.expiry_date)}.
                    Renew immediately.
                  </span>
                </div>
              </div>
            ))}

            {expiringSoon.map((pol, i) => (
              <div
                key={`warn-${i}`}
                className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    {pol.propertyName}
                  </span>{" "}
                  <span className="text-amber-700 dark:text-amber-400">
                    — {insuranceTypeLabel(pol.insurance_type)} policy from{" "}
                    {pol.provider} expires {formatDate(pol.expiry_date)}.
                    Consider renewing soon.
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All good */}
        {uninsured.length === 0 &&
          expired.length === 0 &&
          expiringSoon.length === 0 &&
          allPolicies.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              All properties are insured and policies are current.
            </div>
          )}

        {/* Per-property breakdown */}
        {allPolicies.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Coverage by Property
            </div>
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
                        {prop.insurance.length}{" "}
                        {prop.insurance.length === 1 ? "policy" : "policies"} ·{" "}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
