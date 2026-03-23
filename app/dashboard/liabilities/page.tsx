"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  Pencil,
  TrendingDown,
  Banknote,
  AlertTriangle,
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
} from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

// ─── Helpers ───────────────────────────────────────────────────────────────

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}`;
}

const LIABILITY_TYPE_OPTIONS: { value: LiabilityType; label: string }[] = [
  { value: "mortgage", label: "Mortgage" },
  { value: "credit_card", label: "Credit Card" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "auto_loan", label: "Auto Loan" },
  { value: "student_loan", label: "Student Loan" },
  { value: "other", label: "Other" },
];

function liabilityTypeLabel(type: LiabilityType): string {
  return LIABILITY_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ─── Draft type ────────────────────────────────────────────────────────────

interface LiabilityDraft {
  name: string;
  type: LiabilityType | "";
  balance: string;
  interestRatePct: string;
  minPaymentMonthly: string;
  dueDay: string;
}

const DEFAULT_DRAFT: LiabilityDraft = {
  name: "",
  type: "",
  balance: "",
  interestRatePct: "",
  minPaymentMonthly: "",
  dueDay: "",
};

// ─── Liability Form Dialog ────────────────────────────────────────────────

interface LiabilityDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draft: LiabilityDraft;
  setDraft: React.Dispatch<React.SetStateAction<LiabilityDraft>>;
  onSubmit: () => void;
  isEdit: boolean;
}

function LiabilityDialog({
  open,
  onOpenChange,
  draft,
  setDraft,
  onSubmit,
  isEdit,
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lib-balance">Outstanding balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  $
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
                  $
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
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold truncate">{liability.name}</p>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {liabilityTypeLabel(liability.type)}
              </Badge>
            </div>
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

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function LiabilitiesPage() {
  const storeAddLiability = useFinancialStore((s) => s.addLiability);
  const storeRemoveLiability = useFinancialStore((s) => s.removeLiability);
  const storeLiabilities = useFinancialStore((s) => s.liabilities);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<LiabilityDraft>(DEFAULT_DRAFT);

  const totalDebt = React.useMemo(
    () => storeLiabilities.reduce((s, l) => s + l.balance, 0),
    [storeLiabilities],
  );

  const totalMinPayments = React.useMemo(
    () => storeLiabilities.reduce((s, l) => s + l.minPaymentMonthly, 0),
    [storeLiabilities],
  );

  const avgRate = React.useMemo(() => {
    if (!storeLiabilities.length) return 0;
    const weighted = storeLiabilities.reduce(
      (s, l) => s + l.interestRatePct * l.balance,
      0,
    );
    return totalDebt > 0 ? weighted / totalDebt : 0;
  }, [storeLiabilities, totalDebt]);

  const annualInterestCost = (totalDebt * avgRate) / 100;

  const kpiItems: KpiItem[] = [
    {
      label: "Total Debt",
      value: formatCurrency(totalDebt),
      subline: `${storeLiabilities.length} liabilit${storeLiabilities.length === 1 ? "y" : "ies"}`,
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
      type: liability.type,
      balance: String(liability.balance),
      interestRatePct: String(liability.interestRatePct),
      minPaymentMonthly: String(liability.minPaymentMonthly),
      dueDay: liability.dueDay !== undefined ? String(liability.dueDay) : "",
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!draft.name.trim() || !draft.type) return;

    const now = new Date().toISOString();

    if (editingId) {
      // Remove old entry, add updated
      storeRemoveLiability(editingId);
    }

    const newLiability: Liability = {
      id: editingId ?? uid(),
      name: draft.name.trim(),
      type: draft.type as LiabilityType,
      balance: Number(draft.balance) || 0,
      interestRatePct: Number(draft.interestRatePct) || 0,
      minPaymentMonthly: Number(draft.minPaymentMonthly) || 0,
      dueDay: draft.dueDay ? Number(draft.dueDay) : undefined,
      updatedAt: now,
    };
    storeAddLiability(newLiability);
    setDialogOpen(false);
    setDraft(DEFAULT_DRAFT);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    storeRemoveLiability(id);
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

        {storeLiabilities.length === 0 ? (
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

            {/* Debt breakdown hint */}
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

              {storeLiabilities.map((l) => (
                <LiabilityRow
                  key={l.id}
                  liability={l}
                  totalDebt={totalDebt}
                  onEdit={() => openEdit(l)}
                  onDelete={() => handleDelete(l.id)}
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
      />
    </motion.div>
  );
}
