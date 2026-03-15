"use client";

import Link from "next/link";
import { Pencil, Shield, AlertTriangle } from "lucide-react";
import { DashCard, CardContent } from "@/components/dashboard/dash-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type Property,
  propertyEquity,
  propertyLvr,
  propertyTypeLabel,
  totalInsurancePremium,
  isInsuranceExpiringSoon,
  isInsuranceExpired,
  formatCurrency,
} from "@/lib/client-data";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PropertyRow({ property }: { property: Property }) {
  const equity = propertyEquity(property);
  const lvr = propertyLvr(property);
  const hasInsurance = property.insurance.length > 0;
  const annualPremium = totalInsurancePremium(property);
  const anyExpired = property.insurance.some(isInsuranceExpired);
  const anyExpiringSoon = property.insurance.some(
    (p) => isInsuranceExpiringSoon(p) && !isInsuranceExpired(p),
  );

  const insuranceStatus = anyExpired
    ? "expired"
    : anyExpiringSoon
      ? "expiring"
      : "ok";

  return (
    <DashCard>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: name + location + type */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">{property.name}</span>
              {property.is_primary && (
                <Badge variant="secondary" className="text-xs font-normal">
                  Primary
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-xs font-normal capitalize"
              >
                {propertyTypeLabel(property.property_type)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link
                  href={`/dashboard/properties/${property.property_id}/edit`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit {property.name}</span>
                </Link>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {property.city}, {property.country}
            </div>
          </div>

          {/* Right: stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Market Value</div>
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(property.market_value)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Mortgage</div>
              <div className="text-sm font-semibold tabular-nums">
                {property.mortgage_balance > 0
                  ? formatCurrency(property.mortgage_balance)
                  : "Paid off"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Equity</div>
              <div
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  equity >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              >
                {formatCurrency(equity)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">LVR</div>
              <div
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  lvr > 80
                    ? "text-rose-600 dark:text-rose-400"
                    : lvr > 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "",
                )}
              >
                {lvr}%
              </div>
            </div>

            {/* Insurance — clicking goes to insurance tab */}
            <div>
              <div className="text-xs text-muted-foreground">Insurance</div>
              {hasInsurance ? (
                <Link
                  href="/dashboard/insurance"
                  className="flex items-center gap-1 group"
                >
                  <Shield
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      insuranceStatus === "expired"
                        ? "text-rose-500"
                        : insuranceStatus === "expiring"
                          ? "text-amber-500"
                          : "text-emerald-500",
                    )}
                  />
                  <span className="text-sm font-semibold tabular-nums group-hover:underline underline-offset-2">
                    {formatCurrency(annualPremium)}/yr
                  </span>
                  {insuranceStatus === "expired" && (
                    <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />
                  )}
                  {insuranceStatus === "expiring" && (
                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                  )}
                </Link>
              ) : (
                <Link
                  href="/dashboard/insurance"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline underline-offset-2"
                >
                  None — add
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </DashCard>
  );
}
