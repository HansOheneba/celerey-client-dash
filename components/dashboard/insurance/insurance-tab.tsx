"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faHeartPulse,
  faCar,
  faHouse,
  faUserShield,
  faUmbrella,
  faPersonCane,
  faPaw,
  faPlaneDeparture,
  faCircleCheck,
  faTriangleExclamation,
  faCalendarDay,
  faArrowTrendUp,
  faFileContract,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { KpiStrip, type KpiItem } from "@/components/dashboard/kpi-strip";
import { PropertyInsuranceBridge } from "./property-insurance-bridge";

import {
  type InsurancePolicy,
  type InsuranceCategory,
  type InsuranceRenewalStatus,
  type InsuranceSummaryMetrics,
  INSURANCE_CATEGORIES,
  mockInsurancePolicies,
  mockProperties,
  selectInsuranceSummary,
  cashFlowData,
  formatCurrency,
  insuranceCategoryLabel,
} from "@/lib/client-data";
import Link from "next/link";

// ─── Helpers ───────────────────────────────────────────────────────────────

function categoryIcon(cat: InsuranceCategory) {
  switch (cat) {
    case "life":
      return faUserShield;
    case "health":
      return faHeartPulse;
    case "auto":
      return faCar;
    case "home":
      return faHouse;
    case "disability":
      return faPersonCane;
    case "umbrella":
      return faUmbrella;
    case "travel":
      return faPlaneDeparture;
    case "pet":
      return faPaw;
    default:
      return faShield;
  }
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}`;
}

// ─── Policy row ────────────────────────────────────────────────────────────

function PolicyRow({
  policy,
  renewal,
  onEdit,
  onDelete,
}: {
  policy: InsurancePolicy;
  renewal: InsuranceSummaryMetrics["renewals"][number] | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = renewal?.renewalStatus ?? "ok";
  const days = renewal?.daysUntilRenewal ?? 999;

  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b last:border-b-0 group">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`mt-0.5 p-2 rounded-lg shrink-0 ${
            status === "expired"
              ? "bg-red-50 dark:bg-red-950/30"
              : status === "expiring_soon"
                ? "bg-amber-50 dark:bg-amber-950/30"
                : "bg-muted"
          }`}
        >
          <FontAwesomeIcon
            icon={categoryIcon(policy.category)}
            className={`h-3.5 w-3.5 ${
              status === "expired"
                ? "text-red-500"
                : status === "expiring_soon"
                  ? "text-amber-500"
                  : "text-muted-foreground"
            }`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium leading-tight">{policy.name}</p>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-normal capitalize"
            >
              {insuranceCategoryLabel(policy.category)}
            </Badge>
            {status === "expired" && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30 gap-1"
              >
                <FontAwesomeIcon icon={faCircleXmark} className="h-2.5 w-2.5" />{" "}
                Expired
              </Badge>
            )}
            {status === "expiring_soon" && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 gap-1"
              >
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="h-2.5 w-2.5"
                />{" "}
                Renews in {days}d
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span>{policy.provider}</span>
            {policy.coverage_amount > 0 && (
              <span>Coverage: {formatCurrency(policy.coverage_amount)}</span>
            )}
            {status === "ok" && renewal && (
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faCalendarDay} className="h-2.5 w-2.5" />
                Renews{" "}
                {new Date(policy.renewal_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {policy.notes && (
              <span className="truncate max-w-[220px]">{policy.notes}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(policy.premium_monthly)}
            <span className="text-xs font-normal text-muted-foreground">
              /mo
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(policy.premium_monthly * 12)}/yr
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-400 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Premium breakdown card ────────────────────────────────────────────────

function CoverageBreakdownCard({ policies }: { policies: InsurancePolicy[] }) {
  const active = policies.filter((p) => p.is_active);
  const totalMonthly = active.reduce((s, p) => s + p.premium_monthly, 0);

  const byCategory = active.reduce<Record<string, number>>((acc, p) => {
    const key = insuranceCategoryLabel(p.category);
    acc[key] = (acc[key] ?? 0) + p.premium_monthly;
    return acc;
  }, {});

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FontAwesomeIcon
            icon={faArrowTrendUp}
            className="h-3.5 w-3.5 text-muted-foreground"
          />
          Premium by category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map(([label, monthly]) => {
          const pct = totalMonthly > 0 ? (monthly / totalMonthly) * 100 : 0;
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {pct.toFixed(0)}%
                  </span>
                  <span className="font-medium tabular-nums w-16 text-right">
                    {formatCurrency(monthly)}/mo
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/20 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        <Separator />
        <div className="flex justify-between text-xs pt-0.5">
          <span className="text-muted-foreground">Total monthly</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(totalMonthly)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Renewal timeline card ─────────────────────────────────────────────────

function RenewalTimelineCard({
  renewals,
}: {
  renewals: InsuranceSummaryMetrics["renewals"];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FontAwesomeIcon
            icon={faCalendarDay}
            className="h-3.5 w-3.5 text-muted-foreground"
          />
          Renewal timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {renewals.map((r) => {
          const isExpired = r.renewalStatus === "expired";
          const isSoon = r.renewalStatus === "expiring_soon";
          const label = isExpired
            ? "Expired"
            : isSoon
              ? `${r.daysUntilRenewal}d`
              : new Date(r.renewalDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });

          return (
            <div
              key={r.policy_id}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FontAwesomeIcon
                  icon={categoryIcon(r.category)}
                  className="h-3 w-3 text-muted-foreground shrink-0"
                />
                <span className="text-xs truncate">{r.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isExpired ? (
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="h-3 w-3 text-red-500"
                  />
                ) : isSoon ? (
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="h-3 w-3 text-amber-500"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="h-3 w-3 text-emerald-500"
                  />
                )}
                <span
                  className={`text-xs tabular-nums ${
                    isExpired
                      ? "text-red-600"
                      : isSoon
                        ? "text-amber-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Policy dialog ─────────────────────────────────────────────────────────

type PolicyDraft = {
  name: string;
  category: InsuranceCategory | "";
  provider: string;
  policy_number: string;
  coverage_amount: string;
  premium_monthly: string;
  deductible: string;
  start_date: string;
  renewal_date: string;
  auto_renew: boolean;
  beneficiary: string;
  notes: string;
};

const emptyDraft: PolicyDraft = {
  name: "",
  category: "",
  provider: "",
  policy_number: "",
  coverage_amount: "",
  premium_monthly: "",
  deductible: "",
  start_date: new Date().toISOString().split("T")[0],
  renewal_date: "",
  auto_renew: true,
  beneficiary: "",
  notes: "",
};

function PolicyFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: InsurancePolicy | null;
  onSave: (p: InsurancePolicy) => void;
}) {
  const [draft, setDraft] = React.useState<PolicyDraft>(emptyDraft);

  React.useEffect(() => {
    if (editing) {
      setDraft({
        name: editing.name,
        category: editing.category,
        provider: editing.provider,
        policy_number: editing.policy_number,
        coverage_amount: String(editing.coverage_amount),
        premium_monthly: String(editing.premium_monthly),
        deductible: String(editing.deductible),
        start_date: editing.start_date,
        renewal_date: editing.renewal_date,
        auto_renew: editing.auto_renew,
        beneficiary: editing.beneficiary ?? "",
        notes: editing.notes ?? "",
      });
    } else {
      setDraft(emptyDraft);
    }
  }, [editing, open]);

  function handleSave() {
    if (!draft.name.trim() || !draft.category || !draft.renewal_date) return;
    const now = new Date().toISOString();
    const policy: InsurancePolicy = {
      policy_id: editing?.policy_id ?? uid(),
      user_id: "u-1",
      category: draft.category as InsuranceCategory,
      provider: draft.provider.trim(),
      name: draft.name.trim(),
      policy_number: draft.policy_number.trim(),
      coverage_amount: Number(draft.coverage_amount) || 0,
      premium_monthly: Number(draft.premium_monthly) || 0,
      deductible: Number(draft.deductible) || 0,
      start_date: draft.start_date,
      renewal_date: draft.renewal_date,
      auto_renew: draft.auto_renew,
      beneficiary: draft.beneficiary.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      is_active: true,
      created_at: editing?.created_at ?? now,
      updated_at: now,
    };
    onSave(policy);
    onOpenChange(false);
  }

  const set =
    (field: keyof PolicyDraft) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({ ...d, [field]: e.target.value }));

  const setMoney =
    (field: "coverage_amount" | "premium_monthly" | "deductible") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({
        ...d,
        [field]: e.target.value.replace(/[^\d]/g, ""),
      }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit policy" : "Add insurance policy"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Policy name</Label>
              <Input
                placeholder="e.g. Term Life Insurance"
                value={draft.name}
                onChange={set("name")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={draft.category}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, category: v as InsuranceCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {INSURANCE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Input
                placeholder="e.g. MetLife"
                value={draft.provider}
                onChange={set("provider")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Monthly premium</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  className="pl-7"
                  placeholder="0"
                  value={draft.premium_monthly.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ",",
                  )}
                  onChange={setMoney("premium_monthly")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Coverage amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  className="pl-7"
                  placeholder="0"
                  value={draft.coverage_amount.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ",",
                  )}
                  onChange={setMoney("coverage_amount")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input
                type="date"
                value={draft.start_date}
                onChange={set("start_date")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Renewal date</Label>
              <Input
                type="date"
                value={draft.renewal_date}
                onChange={set("renewal_date")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Policy number</Label>
              <Input
                placeholder="Optional"
                value={draft.policy_number}
                onChange={set("policy_number")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Deductible</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  className="pl-7"
                  placeholder="0"
                  value={draft.deductible.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={setMoney("deductible")}
                />
              </div>
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label>Beneficiary (optional)</Label>
              <Input
                placeholder="e.g. Spouse"
                value={draft.beneficiary}
                onChange={set("beneficiary")}
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Any context or reminders…"
                value={draft.notes}
                onChange={set("notes")}
              />
            </div>

            <div className="flex items-center justify-between col-span-2">
              <Label>Auto-renew</Label>
              <button
                type="button"
                role="switch"
                aria-checked={draft.auto_renew}
                onClick={() =>
                  setDraft((d) => ({ ...d, auto_renew: !d.auto_renew }))
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${draft.auto_renew ? "bg-primary" : "bg-muted"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${draft.auto_renew ? "translate-x-4" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !draft.name.trim() || !draft.category || !draft.renewal_date
            }
          >
            {editing ? "Save changes" : "Add policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete dialog ─────────────────────────────────────────────────────────

function DeleteDialog({
  open,
  onOpenChange,
  policy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  policy: InsurancePolicy | null;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove policy</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove{" "}
          <span className="font-medium text-foreground">{policy?.name}</span>?
          This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category filter ───────────────────────────────────────────────────────

function CategoryFilter({
  value,
  onChange,
  counts,
}: {
  value: InsuranceCategory | "all";
  onChange: (v: InsuranceCategory | "all") => void;
  counts: Record<string, number>;
}) {
  const options: { value: InsuranceCategory | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...INSURANCE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const count =
          opt.value === "all"
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : (counts[opt.value] ?? 0);
        if (opt.value !== "all" && count === 0) return null;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              value === opt.value
                ? "border-foreground bg-foreground text-background"
                : "border-muted bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {opt.label}
            {count > 0 && <span className="ml-1.5 opacity-60">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export function InsuranceTab() {
  const [policies, setPolicies] = React.useState<InsurancePolicy[]>(
    mockInsurancePolicies,
  );
  const [filter, setFilter] = React.useState<InsuranceCategory | "all">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPolicy, setEditingPolicy] =
    React.useState<InsurancePolicy | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] =
    React.useState<InsurancePolicy | null>(null);
  const [homeRedirectOpen, setHomeRedirectOpen] = React.useState(false);

  const properties = mockProperties.filter((p) => p.is_active);
  const monthlyIncome = cashFlowData.income.reduce((s, i) => s + i.amount, 0);

  const insuranceSummary = React.useMemo(
    () => selectInsuranceSummary(policies, monthlyIncome),
    [policies, monthlyIncome],
  );

  const activePolicies = policies.filter((p) => p.is_active);

  const filteredPolicies =
    filter === "all"
      ? activePolicies
      : activePolicies.filter((p) => p.category === filter);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of activePolicies) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [activePolicies]);

  const kpiItems: KpiItem[] = [
    {
      label: "Total Policies",
      value: String(
        insuranceSummary.totalPolicies +
          properties.flatMap((p) => p.insurance).length,
      ),
      subline: `${insuranceSummary.totalPolicies} personal · ${properties.flatMap((p) => p.insurance).length} property`,
    },
    {
      label: "Total Coverage",
      value: formatCurrency(insuranceSummary.totalCoverage),
      subline: "Across all active policies",
    },
    {
      label: "Monthly Premium",
      value: formatCurrency(insuranceSummary.totalMonthlyPremium),
      subline: `${formatCurrency(insuranceSummary.totalAnnualPremium)}/yr · ${insuranceSummary.premiumToIncomeRatioPct}% of income`,
    },
    {
      label: "Expiring Soon",
      value:
        insuranceSummary.expiringSoonCount > 0
          ? `${insuranceSummary.expiringSoonCount} within 60d`
          : "None",
      subline:
        insuranceSummary.expiringSoonCount > 0
          ? "Action may be required"
          : "All renewals on schedule",
      tone: insuranceSummary.expiringSoonCount > 0 ? "warning" : "good",
    },
    {
      label: "Expired",
      value:
        insuranceSummary.expiredCount > 0
          ? `${insuranceSummary.expiredCount} expired`
          : "None",
      subline:
        insuranceSummary.expiredCount > 0
          ? "Needs immediate attention"
          : "All policies current",
      tone: insuranceSummary.expiredCount > 0 ? "danger" : "good",
    },
  ];

  function handleSave(policy: InsurancePolicy) {
    setPolicies((prev) => {
      const idx = prev.findIndex((p) => p.policy_id === policy.policy_id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = policy;
        return next;
      }
      return [...prev, policy];
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setPolicies((prev) =>
      prev.filter((p) => p.policy_id !== deleteTarget.policy_id),
    );
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  const renewalMap = React.useMemo(() => {
    const map = new Map<string, InsuranceSummaryMetrics["renewals"][number]>();
    for (const r of insuranceSummary.renewals) map.set(r.policy_id, r);
    return map;
  }, [insuranceSummary]);

  return (
    <div className="space-y-8">
      <KpiStrip items={kpiItems} cols={5} />

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CoverageBreakdownCard policies={policies} />
        <RenewalTimelineCard renewals={insuranceSummary.renewals} />
      </div>

      {/* Policy list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold tracking-tight">Policies</h2>
            <p className="text-xs text-muted-foreground">
              All your personal insurance policies in one place.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingPolicy(null);
              setDialogOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add policy
          </Button>
        </div>

        <CategoryFilter
          value={filter}
          onChange={setFilter}
          counts={categoryCounts}
        />
        <Separator />

        {filteredPolicies.length > 0 ? (
          <Card>
            <CardContent className="pt-0 pb-0">
              {filteredPolicies.map((p) => (
                <PolicyRow
                  key={p.policy_id}
                  policy={p}
                  renewal={renewalMap.get(p.policy_id)}
                  onEdit={() => {
                    if (p.category === "home") {
                      setHomeRedirectOpen(true); // new state
                    } else {
                      setEditingPolicy(p);
                      setDialogOpen(true);
                    }
                  }}
                  onDelete={() => {
                    if (p.category === "home") {
                      setHomeRedirectOpen(true);
                    } else {
                      setDeleteTarget(p);
                      setDeleteOpen(true);
                    }
                  }}
                />
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-dashed border-muted/60 py-10 text-center">
            <FontAwesomeIcon
              icon={faFileContract}
              className="h-6 w-6 text-muted-foreground/40 mx-auto mb-3"
            />
            <p className="text-sm text-muted-foreground">
              {filter === "all"
                ? "No policies added yet."
                : `No ${filter} policies.`}
            </p>
            {filter === "all" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingPolicy(null);
                  setDialogOpen(true);
                }}
                className="mt-3 gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add your first policy
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Property insurance bridge — untouched */}
      <PropertyInsuranceBridge properties={properties} />

      {/* Dialogs */}
      <PolicyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingPolicy}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        policy={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
      <Dialog open={homeRedirectOpen} onOpenChange={setHomeRedirectOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Managed in Properties</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Home insurance is attached to a specific property and is managed in
            the{" "}
            <Link
              href="/dashboard/properties"
              className="underline underline-offset-2 text-foreground"
              onClick={() => setHomeRedirectOpen(false)}
            >
              Properties tab
            </Link>
            . Go there to add, edit, or remove coverage for your properties.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setHomeRedirectOpen(false)}>
              Dismiss
            </Button>
            <Button asChild>
              <Link href="/dashboard/properties">Go to Properties</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
