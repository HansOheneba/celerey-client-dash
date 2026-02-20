"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type InsurancePolicy,
  type GeneralInsuranceCategory,
  GENERAL_INSURANCE_CATEGORIES,
} from "@/lib/insurance-data";

// ── Form values ─────────────────────────────────────────────────
export type PolicyFormValues = {
  category: GeneralInsuranceCategory;
  provider: string;
  policyName: string;
  policyNumber: string;
  coverageAmount: string;
  annualPremium: string;
  deductible: string;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  beneficiary: string;
  notes: string;
};

const emptyForm: PolicyFormValues = {
  category: "life",
  provider: "",
  policyName: "",
  policyNumber: "",
  coverageAmount: "",
  annualPremium: "",
  deductible: "",
  startDate: "",
  expiryDate: "",
  autoRenew: false,
  beneficiary: "",
  notes: "",
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

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ins_${Math.random().toString(16).slice(2)}`;
}

function formFromPolicy(p: InsurancePolicy): PolicyFormValues {
  return {
    category: p.category,
    provider: p.provider,
    policyName: p.policy_name,
    policyNumber: p.policy_number,
    coverageAmount: formatNumberWithCommas(p.coverage_amount.toString()),
    annualPremium: formatNumberWithCommas(p.annual_premium.toString()),
    deductible: formatNumberWithCommas(p.deductible.toString()),
    startDate: p.start_date,
    expiryDate: p.expiry_date,
    autoRenew: p.auto_renew,
    beneficiary: p.beneficiary,
    notes: p.notes,
  };
}

// ── Component ───────────────────────────────────────────────────
export function PolicyDialog({
  open,
  onOpenChange,
  editingPolicy,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPolicy?: InsurancePolicy | null;
  onSave: (policy: InsurancePolicy) => void;
}) {
  const isEditing = !!editingPolicy;

  const [form, setForm] = React.useState<PolicyFormValues>(emptyForm);

  React.useEffect(() => {
    if (open) {
      setForm(editingPolicy ? formFromPolicy(editingPolicy) : emptyForm);
    }
  }, [open, editingPolicy]);

  function update<K extends keyof PolicyFormValues>(
    key: K,
    value: PolicyFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMoneyInput(
    key: "coverageAmount" | "annualPremium" | "deductible",
    value: string,
  ) {
    update(key, formatNumberWithCommas(value));
  }

  const isValid =
    form.provider.trim().length > 0 &&
    form.policyName.trim().length > 0 &&
    toNumber(form.annualPremium) > 0 &&
    form.expiryDate.length > 0;

  function handleSubmit() {
    if (!isValid) return;

    const now = new Date().toISOString();
    const policy: InsurancePolicy = {
      policy_id: editingPolicy?.policy_id ?? uid(),
      user_id: editingPolicy?.user_id ?? "u-1",
      category: form.category,
      provider: form.provider.trim(),
      policy_name: form.policyName.trim(),
      policy_number: form.policyNumber.trim(),
      coverage_amount: toNumber(form.coverageAmount),
      annual_premium: toNumber(form.annualPremium),
      deductible: toNumber(form.deductible),
      start_date: form.startDate,
      expiry_date: form.expiryDate,
      auto_renew: form.autoRenew,
      beneficiary: form.beneficiary.trim(),
      notes: form.notes.trim(),
      is_active: true,
      created_at: editingPolicy?.created_at ?? now,
      updated_at: now,
    };

    onSave(policy);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Policy" : "Add Insurance Policy"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Category + Provider */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="policy-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  update("category", v as GeneralInsuranceCategory)
                }
              >
                <SelectTrigger id="policy-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GENERAL_INSURANCE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-provider">Provider</Label>
              <Input
                id="policy-provider"
                placeholder="e.g. MetLife, GEICO"
                value={form.provider}
                onChange={(e) => update("provider", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Name + Policy # */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Policy name</Label>
              <Input
                id="policy-name"
                placeholder="e.g. Term Life 20-Year"
                value={form.policyName}
                onChange={(e) => update("policyName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-num">Policy number</Label>
              <Input
                id="policy-num"
                placeholder="e.g. ML-2022-44190"
                value={form.policyNumber}
                onChange={(e) => update("policyNumber", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Financials */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pol-coverage">Coverage amount</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  $
                </div>
                <Input
                  id="pol-coverage"
                  type="text"
                  inputMode="numeric"
                  placeholder="1,000,000"
                  value={form.coverageAmount}
                  onChange={(e) =>
                    handleMoneyInput("coverageAmount", e.target.value)
                  }
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave 0 for health plans without a cap.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pol-premium">Annual premium</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  $
                </div>
                <Input
                  id="pol-premium"
                  type="text"
                  inputMode="numeric"
                  placeholder="1,200"
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
              <Label htmlFor="pol-deductible">Deductible</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  $
                </div>
                <Input
                  id="pol-deductible"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.deductible}
                  onChange={(e) =>
                    handleMoneyInput("deductible", e.target.value)
                  }
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pol-start">Start date</Label>
              <Input
                id="pol-start"
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pol-expiry">Expiry date</Label>
              <Input
                id="pol-expiry"
                type="date"
                value={form.expiryDate}
                onChange={(e) => update("expiryDate", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Auto-renew + Beneficiary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Auto-renew</Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={form.autoRenew}
                  onCheckedChange={(v) => update("autoRenew", v)}
                />
                <span className="text-sm">{form.autoRenew ? "Yes" : "No"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pol-beneficiary">Beneficiary</Label>
              <Input
                id="pol-beneficiary"
                placeholder="e.g. Spouse, Estate"
                value={form.beneficiary}
                onChange={(e) => update("beneficiary", e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="pol-notes">Notes</Label>
            <Textarea
              id="pol-notes"
              placeholder="Additional details about this policy..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
