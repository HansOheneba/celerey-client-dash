"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  Pencil,
  TrendingDown,
  Banknote,
  AlertTriangle,
  Building2,
  ArrowRight,
} from "lucide-react";

import { KpiStrip, type KpiItem } from "@/components/dashboard/kpi-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  formatCurrency,
  type Liability,
  type LiabilityType,
  type Property,
  type PropertyMortgage,
} from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

// ─── Helpers ───────────────────────────────────────────────────────────────

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}`;
}

/** Returns the currency symbol for the current locale's default currency. */
function getCurrencySymbol(): string {
  try {
    return (
      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? "$"
    );
  } catch {
    return "$";
  }
}

// Mortgages are excluded — they are managed directly on properties.
const LIABILITY_TYPE_OPTIONS: { value: LiabilityType; label: string }[] = [
  { value: "credit_card", label: "Credit Card" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "auto_loan", label: "Auto Loan" },
  { value: "student_loan", label: "Student Loan" },
  { value: "other", label: "Other" },
];

function liabilityTypeLabel(type: LiabilityType): string {
  return LIABILITY_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ─── Property-linked mortgage entry ──────────────────────────────────────

interface PropertyLinkedMortgage {
  property: Property;
  mortgage: PropertyMortgage;
}

// ─── Draft type ────────────────────────────────────────────────────────────

interface LiabilityDraft {
  name: string;
  lender: string;
  type: LiabilityType | "";
  balance: string;
  interestRatePct: string;
  minPaymentMonthly: string;
  dueDay: string;
  originalLoanAmount: string;
  expectedPayoffDate: string;
}

const DEFAULT_DRAFT: LiabilityDraft = {
  name: "",
  lender: "",
  type: "",
  balance: "",
  interestRatePct: "",
  minPaymentMonthly: "",
  dueDay: "",
  originalLoanAmount: "",
  expectedPayoffDate: "",
};

// ─── Liability Form Dialog ────────────────────────────────────────────────

interface LiabilityDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draft: LiabilityDraft;
  setDraft: React.Dispatch<React.SetStateAction<LiabilityDraft>>;
  onSubmit: () => void;
  isEdit: boolean;
  currencySymbol: string;
}

function LiabilityDialog({
  open,
  onOpenChange,
  draft,
  setDraft,
  onSubmit,
  isEdit,
  currencySymbol,
}: LiabilityDialogProps) {
  const canSave = !!draft.name.trim() && !!draft.type && !!draft.balance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-red-400" />
            {isEdit ? "Edit liability" : "Add liability"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="lib-name">Name</Label>
            <Input
              id="lib-name"
              placeholder="e.g. Home mortgage"
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lib-lender">Lender or provider</Label>
            <Input
              id="lib-lender"
              placeholder="e.g. Barclays, Standard Bank, Stanbic"
              value={draft.lender}
              onChange={(e) =>
                setDraft((d) => ({ ...d, lender: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={draft.type}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, type: v as LiabilityType }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                {LIABILITY_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <Building2 className="h-3 w-3" />
              Mortgages are managed directly on each property.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lib-balance">Outstanding balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="lib-balance"
                  type="number"
                  placeholder="0"
                  className="pl-6"
                  value={draft.balance}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, balance: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-rate">Interest rate (%)</Label>
              <Input
                id="lib-rate"
                type="number"
                placeholder="0"
                value={draft.interestRatePct}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, interestRatePct: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lib-payment">Min monthly payment</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="lib-payment"
                  type="number"
                  placeholder="0"
                  className="pl-6"
                  value={draft.minPaymentMonthly}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      minPaymentMonthly: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-due">Due day of month</Label>
              <Input
                id="lib-due"
                type="number"
                min="1"
                max="31"
                placeholder="1"
                value={draft.dueDay}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, dueDay: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lib-original">
                Original loan{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="lib-original"
                  type="number"
                  placeholder="0"
                  className="pl-6"
                  value={draft.originalLoanAmount}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      originalLoanAmount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lib-payoff">
                Payoff date{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="lib-payoff"
                type="date"
                value={draft.expectedPayoffDate}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    expectedPayoffDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSave}>
            {isEdit ? "Save changes" : "Add liability"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  name,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-500" />
            Remove liability
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-foreground">{name}</span>? This
          cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Liability Row ────────────────────────────────────────────────────────

function LiabilityRow({
  liability,
  totalDebt,
  onEdit,
  onDelete,
}: {
  liability: Liability;
  totalDebt: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pct = totalDebt > 0 ? (liability.balance / totalDebt) * 100 : 0;
  const annualInterest = (liability.balance * liability.interestRatePct) / 100;

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold truncate">{liability.name}</p>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {liabilityTypeLabel(liability.type)}
              </Badge>
            </div>
            {liability.lender && (
              <p className="text-xs text-muted-foreground mb-1">
                {liability.lender}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
              <div>
                <p className="text-muted-foreground">Balance</p>
                <p className="font-semibold tabular-nums text-red-500">
                  {formatCurrency(liability.balance)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Rate</p>
                <p className="font-medium tabular-nums">
                  {liability.interestRatePct.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Min payment</p>
                <p className="font-medium tabular-nums">
                  {formatCurrency(liability.minPaymentMonthly)}/mo
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Annual interest</p>
                <p className="font-medium tabular-nums text-amber-600">
                  {formatCurrency(annualInterest)}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{pct.toFixed(1)}% of total debt</span>
                {liability.dueDay && (
                  <span>Due on the {liability.dueDay}th</span>
                )}
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Property-linked mortgage card (read-only) ────────────────────────────

function PropertyMortgageCard({
  entry,
  totalDebt,
  onGoToProperty,
}: {
  entry: PropertyLinkedMortgage;
  totalDebt: number;
  onGoToProperty: () => void;
}) {
  const { property, mortgage } = entry;
  const pct = totalDebt > 0 ? (mortgage.balance / totalDebt) * 100 : 0;
  const annualInterest = (mortgage.balance * mortgage.interest_rate_pct) / 100;

  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold truncate">
                {property.name} — Mortgage
              </p>
              <Badge
                variant="outline"
                className="text-[10px] shrink-0 gap-1 text-muted-foreground border-muted-foreground/30 bg-background"
              >
                <Building2 className="h-2.5 w-2.5" />
                Managed via Property
              </Badge>
            </div>
            {mortgage.lender && (
              <p className="text-xs text-muted-foreground mb-1">
                {mortgage.lender}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
              <div>
                <p className="text-muted-foreground">Balance</p>
                <p className="font-semibold tabular-nums text-red-500">
                  {formatCurrency(mortgage.balance)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Rate</p>
                <p className="font-medium tabular-nums">
                  {mortgage.interest_rate_pct.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Min payment</p>
                <p className="font-medium tabular-nums">
                  {formatCurrency(mortgage.min_payment_monthly)}/mo
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Annual interest</p>
                <p className="font-medium tabular-nums text-amber-600">
                  {formatCurrency(annualInterest)}
                </p>
              </div>
            </div>
            {(mortgage.original_loan_amount ||
              mortgage.expected_payoff_date) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
                {mortgage.original_loan_amount && (
                  <div>
                    <p className="text-muted-foreground">Original loan</p>
                    <p className="font-medium tabular-nums">
                      {formatCurrency(mortgage.original_loan_amount)}
                    </p>
                  </div>
                )}
                {mortgage.expected_payoff_date && (
                  <div>
                    <p className="text-muted-foreground">Expected payoff</p>
                    <p className="font-medium">
                      {new Date(
                        mortgage.expected_payoff_date,
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{pct.toFixed(1)}% of total debt</span>
                {mortgage.due_day && (
                  <span>Due on the {mortgage.due_day}th</span>
                )}
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          </div>
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={onGoToProperty}
            >
              Edit in Properties
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function LiabilitiesPage() {
  const router = useRouter();
  const storeAddLiability = useFinancialStore((s) => s.addLiability);
  const storeUpdateLiability = useFinancialStore((s) => s.updateLiability);
  const storeRemoveLiability = useFinancialStore((s) => s.removeLiability);
  const storeLiabilities = useFinancialStore((s) => s.liabilities);
  const storeProperties = useFinancialStore((s) => s.propertyAssets);

  const currencySymbol = React.useMemo(() => getCurrencySymbol(), []);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<LiabilityDraft>(DEFAULT_DRAFT);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // ── Property-linked mortgages derived from store ──────────────────────────
  const propertyMortgages = React.useMemo<PropertyLinkedMortgage[]>(
    () =>
      storeProperties
        .filter((p) => p.is_active && p.mortgage)
        .map((p) => ({ property: p, mortgage: p.mortgage! })),
    [storeProperties],
  );

  // ── Combined totals (standalone + property mortgages) ────────────────────
  const totalDebt = React.useMemo(
    () =>
      storeLiabilities.reduce((s, l) => s + l.balance, 0) +
      propertyMortgages.reduce((s, e) => s + e.mortgage.balance, 0),
    [storeLiabilities, propertyMortgages],
  );

  const totalMinPayments = React.useMemo(
    () =>
      storeLiabilities.reduce((s, l) => s + l.minPaymentMonthly, 0) +
      propertyMortgages.reduce((s, e) => s + e.mortgage.min_payment_monthly, 0),
    [storeLiabilities, propertyMortgages],
  );

  const avgRate = React.useMemo(() => {
    if (totalDebt === 0) return 0;
    const standaloneWeighted = storeLiabilities.reduce(
      (s, l) => s + l.interestRatePct * l.balance,
      0,
    );
    const propWeighted = propertyMortgages.reduce(
      (s, e) => s + e.mortgage.interest_rate_pct * e.mortgage.balance,
      0,
    );
    return (standaloneWeighted + propWeighted) / totalDebt;
  }, [storeLiabilities, propertyMortgages, totalDebt]);

  const annualInterestCost = (totalDebt * avgRate) / 100;

  // ── Debt by lender breakdown — named lenders only ────────────────────────
  const debtByLender = React.useMemo(() => {
    const map = new Map<string, number>();
    storeLiabilities.forEach((l) => {
      const key = l.lender?.trim();
      if (!key) return;
      map.set(key, (map.get(key) ?? 0) + l.balance);
    });
    propertyMortgages.forEach((e) => {
      const key = e.mortgage.lender?.trim();
      if (!key) return;
      map.set(key, (map.get(key) ?? 0) + e.mortgage.balance);
    });
    return [...map.entries()]
      .map(([lender, balance]) => ({ lender, balance }))
      .sort((a, b) => b.balance - a.balance);
  }, [storeLiabilities, propertyMortgages]);

  const totalEntries = storeLiabilities.length + propertyMortgages.length;

  const kpiItems: KpiItem[] = [
    {
      label: "Total Debt",
      value: formatCurrency(totalDebt),
      subline: `${totalEntries} liabilit${totalEntries === 1 ? "y" : "ies"}`,
      tone: "neutral",
    },
    {
      label: "Min Monthly Payments",
      value: formatCurrency(totalMinPayments),
      subline: "Required monthly outflow",
      tone: totalMinPayments > 0 ? "warning" : "neutral",
    },
    {
      label: "Weighted Avg Rate",
      value: `${avgRate.toFixed(2)}%`,
      subline: "Interest across all debts",
      tone: avgRate > 15 ? "danger" : avgRate > 8 ? "warning" : "good",
    },
    {
      label: "Annual Interest Cost",
      value: formatCurrency(annualInterestCost),
      subline: "Estimated yearly interest",
      tone: annualInterestCost > 5000 ? "danger" : "warning",
    },
  ];

  function openCreate() {
    setEditingId(null);
    setDraft(DEFAULT_DRAFT);
    setDialogOpen(true);
  }

  function openEdit(liability: Liability) {
    setEditingId(liability.id);
    setDraft({
      name: liability.name,
      lender: liability.lender ?? "",
      type: liability.type,
      balance: String(liability.balance),
      interestRatePct: String(liability.interestRatePct),
      minPaymentMonthly: String(liability.minPaymentMonthly),
      dueDay: liability.dueDay !== undefined ? String(liability.dueDay) : "",
      originalLoanAmount: liability.originalLoanAmount
        ? String(liability.originalLoanAmount)
        : "",
      expectedPayoffDate: liability.expectedPayoffDate ?? "",
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!draft.name.trim() || !draft.type) return;

    const now = new Date().toISOString();

    if (editingId) {
      // Merge patch into existing entry — no remove needed
      storeUpdateLiability(editingId, {
        name: draft.name.trim(),
        lender: draft.lender.trim() || undefined,
        type: draft.type as LiabilityType,
        balance: Number(draft.balance) || 0,
        interestRatePct: Number(draft.interestRatePct) || 0,
        minPaymentMonthly: Number(draft.minPaymentMonthly) || 0,
        dueDay: draft.dueDay ? Number(draft.dueDay) : undefined,
        originalLoanAmount: draft.originalLoanAmount
          ? Number(draft.originalLoanAmount)
          : undefined,
        expectedPayoffDate: draft.expectedPayoffDate || undefined,
      });
    } else {
      const newLiability: Liability = {
        id: uid(),
        name: draft.name.trim(),
        lender: draft.lender.trim() || undefined,
        type: draft.type as LiabilityType,
        balance: Number(draft.balance) || 0,
        interestRatePct: Number(draft.interestRatePct) || 0,
        minPaymentMonthly: Number(draft.minPaymentMonthly) || 0,
        dueDay: draft.dueDay ? Number(draft.dueDay) : undefined,
        originalLoanAmount: draft.originalLoanAmount
          ? Number(draft.originalLoanAmount)
          : undefined,
        expectedPayoffDate: draft.expectedPayoffDate || undefined,
        updatedAt: now,
      };
      storeAddLiability(newLiability);
    }

    setDialogOpen(false);
    setDraft(DEFAULT_DRAFT);
    setEditingId(null);
  }

  function requestDelete(id: string, name: string) {
    setDeleteConfirm({ id, name });
  }

  function confirmDelete() {
    if (deleteConfirm) {
      storeRemoveLiability(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      <div className="mx-auto w-full px-4 py-8 md:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Liabilities
            </h1>
            <p className="text-sm text-muted-foreground">
              All your debts and obligations in one place.
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Add liability
          </Button>
        </div>

        {totalEntries === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <TrendingDown className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">No liabilities added yet</p>
              <p className="text-xs text-muted-foreground">
                Add your debts to get a full picture of your net worth.
              </p>
            </div>
            <Button size="sm" onClick={openCreate}>
              Add liability
            </Button>
          </div>
        ) : (
          <>
            {/* KPI Strip */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <KpiStrip items={kpiItems} cols={4} />
            </motion.div>

            {/* Debt by lender */}
            {debtByLender.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Debt by lender
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {debtByLender.map(({ lender, balance }) => (
                      <div
                        key={lender}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">{lender}</span>
                        <span className="font-semibold tabular-nums text-red-500">
                          {formatCurrency(balance)}
                        </span>
                      </div>
                    ))}
                    <Separator className="mt-1" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">Total</span>
                      <span className="font-bold tabular-nums text-red-500">
                        {formatCurrency(totalDebt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* High rate warning */}
            {avgRate > 15 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    High average interest rate
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your weighted average rate is{" "}
                    <span className="font-medium">{avgRate.toFixed(2)}%</span>.
                    Consider consolidating high-interest debts to reduce your
                    annual interest cost of{" "}
                    <span className="font-medium">
                      {formatCurrency(annualInterestCost)}
                    </span>
                    .
                  </p>
                </div>
              </motion.div>
            )}

            {/* Liability list */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  All liabilities
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Total: {formatCurrency(totalDebt)}</span>
                </div>
              </div>

              {/* Standalone liabilities */}
              {storeLiabilities.length === 0 &&
                propertyMortgages.length > 0 && (
                  <p className="text-xs text-muted-foreground py-1">
                    No standalone liabilities added. Mortgages are managed via
                    your properties.
                  </p>
                )}
              {storeLiabilities.map((l) => (
                <LiabilityRow
                  key={l.id}
                  liability={l}
                  totalDebt={totalDebt}
                  onEdit={() => openEdit(l)}
                  onDelete={() => requestDelete(l.id, l.name)}
                />
              ))}

              {/* Property-linked mortgages (read-only) */}
              {propertyMortgages.map((entry) => (
                <PropertyMortgageCard
                  key={entry.property.property_id}
                  entry={entry}
                  totalDebt={totalDebt}
                  onGoToProperty={() =>
                    router.push(
                      `/dashboard/properties/${entry.property.property_id}/edit?focus=mortgage`,
                    )
                  }
                />
              ))}

              <Separator />

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Total debt</p>
                      <p className="text-xs text-muted-foreground">
                        Minimum monthly obligations:{" "}
                        {formatCurrency(totalMinPayments)}/mo
                      </p>
                    </div>
                    <p className="text-lg font-bold tabular-nums text-red-500">
                      {formatCurrency(totalDebt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <LiabilityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={draft}
        setDraft={setDraft}
        onSubmit={handleSubmit}
        isEdit={!!editingId}
        currencySymbol={currencySymbol}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        name={deleteConfirm?.name ?? ""}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}
