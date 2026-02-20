"use client";

import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type InsurancePolicy,
  policyStatus,
  categoryLabel,
} from "@/lib/insurance-data";
import { type Property, totalInsurancePremium } from "@/lib/property-data";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function InsuranceAlerts({
  policies,
  properties,
}: {
  policies: InsurancePolicy[];
  properties: Property[];
}) {
  const expired = policies.filter((p) => policyStatus(p) === "expired");
  const expiringSoon = policies.filter(
    (p) => policyStatus(p) === "expiring_soon",
  );
  const uninsuredProps = properties.filter((p) => p.insurance.length === 0);

  const totalPremiums =
    policies
      .filter((p) => p.is_active)
      .reduce((s, p) => s + p.annual_premium, 0) +
    properties.reduce((s, p) => s + totalInsurancePremium(p), 0);

  const allGood =
    expired.length === 0 &&
    expiringSoon.length === 0 &&
    uninsuredProps.length === 0;

  if (allGood && policies.length === 0 && properties.length === 0) return null;

  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Alerts & Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allGood && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            All policies are current and no coverage gaps detected.
          </div>
        )}

        {expired.map((p) => (
          <div
            key={p.policy_id}
            className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="text-rose-700 dark:text-rose-400">
              <span className="font-medium text-rose-800 dark:text-rose-300">
                {p.policy_name}
              </span>{" "}
              ({categoryLabel(p.category)}) from {p.provider} has expired. Renew
              immediately.
            </span>
          </div>
        ))}

        {expiringSoon.map((p) => (
          <div
            key={p.policy_id}
            className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-400">
              <span className="font-medium text-amber-800 dark:text-amber-300">
                {p.policy_name}
              </span>{" "}
              ({categoryLabel(p.category)}) expires soon. Check renewal options.
            </span>
          </div>
        ))}

        {uninsuredProps.map((p) => (
          <div
            key={p.property_id}
            className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-400">
              Property{" "}
              <span className="font-medium text-amber-800 dark:text-amber-300">
                {p.name}
              </span>{" "}
              has no insurance coverage.
            </span>
          </div>
        ))}

        {/* Cost insight */}
        {totalPremiums > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-sm text-sky-800 dark:text-sky-300">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your total insurance costs are{" "}
              <span className="font-semibold">
                {formatCurrency(totalPremiums)}/yr
              </span>{" "}
              ({formatCurrency(Math.round(totalPremiums / 12))}/mo). Review
              annually to ensure competitive rates.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
