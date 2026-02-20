"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { InsuranceMiniStat } from "./mini-stat";
import { PolicyRow } from "./policy-row";
import { PolicyDialog } from "./policy-dialog";
import { DeletePolicyDialog } from "./delete-policy-dialog";
import { CategoryFilter, type FilterValue } from "./category-filter";
import { PropertyInsuranceBridge } from "./property-insurance-bridge";
import { InsuranceAlerts } from "./alerts-card";

import {
  type InsurancePolicy,
  mockInsurancePolicies,
  policyStatus,
} from "@/lib/insurance-data";
import { mockProperties, totalInsurancePremium } from "@/lib/property-data";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function InsuranceTab() {
  // ── State ───────────────────────────────────────────────────
  const [policies, setPolicies] = React.useState<InsurancePolicy[]>(
    mockInsurancePolicies,
  );
  const [filter, setFilter] = React.useState<FilterValue>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPolicy, setEditingPolicy] =
    React.useState<InsurancePolicy | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] =
    React.useState<InsurancePolicy | null>(null);

  // ── Derived ─────────────────────────────────────────────────
  const properties = mockProperties.filter((p) => p.is_active);

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

  const totalGeneralPremiums = React.useMemo(
    () => activePolicies.reduce((s, p) => s + p.annual_premium, 0),
    [activePolicies],
  );

  const totalPropertyPremiums = React.useMemo(
    () => properties.reduce((s, p) => s + totalInsurancePremium(p), 0),
    [properties],
  );

  const totalAllPremiums = totalGeneralPremiums + totalPropertyPremiums;

  const totalGeneralCoverage = React.useMemo(
    () => activePolicies.reduce((s, p) => s + p.coverage_amount, 0),
    [activePolicies],
  );

  const alertCount = React.useMemo(() => {
    const expired = activePolicies.filter(
      (p) => policyStatus(p) === "expired",
    ).length;
    const expiring = activePolicies.filter(
      (p) => policyStatus(p) === "expiring_soon",
    ).length;
    const uninsured = properties.filter((p) => p.insurance.length === 0).length;
    return expired + expiring + uninsured;
  }, [activePolicies, properties]);

  // ── Handlers ────────────────────────────────────────────────
  function handleAdd() {
    setEditingPolicy(null);
    setDialogOpen(true);
  }

  function handleEdit(policy: InsurancePolicy) {
    setEditingPolicy(policy);
    setDialogOpen(true);
  }

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

  function handleDeleteRequest(policy: InsurancePolicy) {
    setDeleteTarget(policy);
    setDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setPolicies((prev) =>
      prev.filter((p) => p.policy_id !== deleteTarget.policy_id),
    );
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      {/* Top-level stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <InsuranceMiniStat
          label="Total Policies"
          value={String(
            activePolicies.length +
              properties.flatMap((p) => p.insurance).length,
          )}
        />
        <InsuranceMiniStat
          label="Total Coverage"
          value={formatCurrency(totalGeneralCoverage)}
          hint="General policies only"
        />
        <InsuranceMiniStat
          label="Annual Premiums"
          value={formatCurrency(totalAllPremiums)}
          hint={`${formatCurrency(Math.round(totalAllPremiums / 12))}/mo`}
        />
        <InsuranceMiniStat
          label="Monthly Cost"
          value={formatCurrency(Math.round(totalAllPremiums / 12))}
        />
        <InsuranceMiniStat
          label="Attention"
          value={
            alertCount > 0
              ? `${alertCount} alert${alertCount > 1 ? "s" : ""}`
              : "All good"
          }
          tone={alertCount > 0 ? "warn" : "good"}
        />
      </div>

      {/* Alerts */}

      {/* General policies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              General Policies
            </h2>
            <p className="text-sm text-muted-foreground">
              Life, health, auto, disability, and other personal insurance.
            </p>
          </div>
          <Button size="sm" className="rounded-full" onClick={handleAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Policy
          </Button>
        </div>

        <CategoryFilter
          value={filter}
          onChange={setFilter}
          counts={categoryCounts}
        />

        <Separator />

        {filteredPolicies.length > 0 ? (
            filteredPolicies.map((p) => (
                <PolicyRow
                key={p.policy_id}
                policy={p}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                />
            ))
        ) : (
            <div className="rounded-xl border border-dashed border-muted/60 p-8 text-center text-sm text-muted-foreground">
            {filter === "all"
              ? "No general insurance policies yet. Add one to get started."
              : "No policies in this category."}
          </div>
        )}
      </div>

      {/* Property insurance bridge */}
      <PropertyInsuranceBridge properties={properties} />

      {/* Dialogs */}
      <PolicyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPolicy={editingPolicy}
        onSave={handleSave}
      />

        <InsuranceAlerts policies={activePolicies} properties={properties} />
      <DeletePolicyDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        policy={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
