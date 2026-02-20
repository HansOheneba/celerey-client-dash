"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  type InsurancePolicy,
  categoryLabel,
  policyStatus,
  statusLabel,
} from "@/lib/insurance-data";

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

export function PolicyRow({
  policy,
  onEdit,
  onDelete,
}: {
  policy: InsurancePolicy;
  onEdit?: (p: InsurancePolicy) => void;
  onDelete?: (p: InsurancePolicy) => void;
}) {
  const status = policyStatus(policy);

  const statusBadge = (() => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 text-xs font-normal">
            {statusLabel(status)}
          </Badge>
        );
      case "expiring_soon":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30 text-xs font-normal">
            {statusLabel(status)}
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="text-xs font-normal">
            {statusLabel(status)}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="text-xs font-normal">
            {statusLabel(status)}
          </Badge>
        );
    }
  })();

  return (
    <Card
      className={cn(
        "border-muted/60 bg-background/60 shadow-sm",
        status === "expired" && "border-rose-500/30 bg-rose-500/5",
        status === "expiring_soon" && "border-amber-500/30 bg-amber-500/5",
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: name + provider + category */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-semibold truncate">
                {policy.policy_name}
              </span>
              <Badge
                variant="outline"
                className="text-xs font-normal capitalize shrink-0"
              >
                {categoryLabel(policy.category)}
              </Badge>
              {statusBadge}
              {policy.auto_renew && (
                <Badge
                  variant="secondary"
                  className="text-xs font-normal shrink-0"
                >
                  Auto-renew
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {policy.provider} · #{policy.policy_number}
            </div>
            {policy.beneficiary && (
              <div className="text-xs text-muted-foreground">
                Beneficiary: {policy.beneficiary}
              </div>
            )}
          </div>

          {/* Right: stats + actions */}
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              <div>
                <div className="text-xs text-muted-foreground">Coverage</div>
                <div className="text-sm font-semibold tabular-nums">
                  {policy.coverage_amount > 0
                    ? formatCurrency(policy.coverage_amount)
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Premium/yr</div>
                <div className="text-sm font-semibold tabular-nums">
                  {formatCurrency(policy.annual_premium)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Deductible</div>
                <div className="text-sm font-semibold tabular-nums">
                  {policy.deductible > 0
                    ? formatCurrency(policy.deductible)
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Expires</div>
                <div
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    status === "expired" && "text-rose-600 dark:text-rose-400",
                    status === "expiring_soon" &&
                      "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {formatDate(policy.expiry_date)}
                </div>
              </div>
            </div>

            <div className="flex gap-1 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(policy)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-rose-600"
                  onClick={() => onDelete(policy)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {policy.notes && (
          <div className="mt-2 text-xs text-muted-foreground">
            {policy.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
