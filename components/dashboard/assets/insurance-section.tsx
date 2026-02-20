"use client";

import * as React from "react";
import { Plus, Shield, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type PropertyInsurance,
  type InsuranceType,
  INSURANCE_TYPE_OPTIONS,
} from "@/lib/property-data";
import { InsurancePolicyCard } from "./insurance-policy-card";

// ── Types ───────────────────────────────────────────────────────
export type InsuranceFormValues = {
  insuranceType: InsuranceType;
  provider: string;
  policyNumber: string;
  coverageAmount: string;
  annualPremium: string;
  deductible: string;
  expiryDate: string;
};

const emptyInsuranceForm: InsuranceFormValues = {
  insuranceType: "homeowners",
  provider: "",
  policyNumber: "",
  coverageAmount: "",
  annualPremium: "",
  deductible: "",
  expiryDate: "",
};

// ── Helpers ─────────────────────────────────────────────────────
function formatNumberWithCommas(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function toNumber(value: string): number {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ── Component ───────────────────────────────────────────────────
export function InsuranceSection({
  policies,
  onChange,
}: {
  policies: PropertyInsurance[];
  onChange: (policies: PropertyInsurance[]) => void;
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] =
    React.useState<InsuranceFormValues>(emptyInsuranceForm);

  function update<K extends keyof InsuranceFormValues>(
    key: K,
    value: InsuranceFormValues[K],
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMoneyInput(
    key: "coverageAmount" | "annualPremium" | "deductible",
    value: string,
  ): void {
    update(key, formatNumberWithCommas(value));
  }

  const isValid =
    form.provider.trim().length > 0 &&
    toNumber(form.coverageAmount) > 0 &&
    toNumber(form.annualPremium) > 0 &&
    form.expiryDate.length > 0;

  function handleAdd() {
    if (!isValid) return;

    const newPolicy: PropertyInsurance = {
      insurance_type: form.insuranceType,
      provider: form.provider.trim(),
      policy_number: form.policyNumber.trim(),
      coverage_amount: toNumber(form.coverageAmount),
      annual_premium: toNumber(form.annualPremium),
      deductible: toNumber(form.deductible),
      expiry_date: form.expiryDate,
    };

    onChange([...policies, newPolicy]);
    setForm(emptyInsuranceForm);
    setShowForm(false);
  }

  function handleRemove(index: number) {
    onChange(policies.filter((_, i) => i !== index));
  }

  const totalPremium = policies.reduce((s, p) => s + p.annual_premium, 0);
  const totalCoverage = policies.reduce((s, p) => s + p.coverage_amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Property Insurance</h3>
          {policies.length === 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              No coverage
            </span>
          )}
        </div>
        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Policy
          </Button>
        )}
      </div>

      {/* Existing policies */}
      {policies.length > 0 && (
        <div className="space-y-3">
          {policies.map((p, i) => (
            <InsurancePolicyCard
              key={`${p.policy_number}-${i}`}
              policy={p}
              onRemove={() => handleRemove(i)}
            />
          ))}

          {policies.length > 1 && (
            <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  Total Coverage:{" "}
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(totalCoverage)}
                  </span>
                </span>
                <span>
                  Total Premium/yr:{" "}
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(totalPremium)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <Card className="border-muted/60 bg-muted/10 shadow-sm">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm">New Insurance Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type + Provider */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="insurance-type">Insurance type</Label>
                <Select
                  value={form.insuranceType}
                  onValueChange={(v) =>
                    update("insuranceType", v as InsuranceType)
                  }
                >
                  <SelectTrigger id="insurance-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance-provider">Provider</Label>
                <Input
                  id="insurance-provider"
                  placeholder="e.g. State Farm, Allianz"
                  value={form.provider}
                  onChange={(e) => update("provider", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Policy # */}
            <div className="space-y-2">
              <Label htmlFor="policy-number">Policy number (optional)</Label>
              <Input
                id="policy-number"
                placeholder="e.g. HO-2024-88412"
                value={form.policyNumber}
                onChange={(e) => update("policyNumber", e.target.value)}
              />
            </div>

            <Separator />

            {/* Financial details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="coverage-amount">Coverage amount</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    $
                  </div>
                  <Input
                    id="coverage-amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="850,000"
                    value={form.coverageAmount}
                    onChange={(e) =>
                      handleMoneyInput("coverageAmount", e.target.value)
                    }
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual-premium">Annual premium</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    $
                  </div>
                  <Input
                    id="annual-premium"
                    type="text"
                    inputMode="numeric"
                    placeholder="2,400"
                    value={form.annualPremium}
                    onChange={(e) =>
                      handleMoneyInput("annualPremium", e.target.value)
                    }
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deductible">Deductible</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    $
                  </div>
                  <Input
                    id="deductible"
                    type="text"
                    inputMode="numeric"
                    placeholder="2,500"
                    value={form.deductible}
                    onChange={(e) =>
                      handleMoneyInput("deductible", e.target.value)
                    }
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Expiry date */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="insurance-expiry">Policy expiry date</Label>
                <Input
                  id="insurance-expiry"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => update("expiryDate", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyInsuranceForm);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!isValid}
                onClick={handleAdd}
              >
                Add Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
