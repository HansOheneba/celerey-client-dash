"use client";

import * as React from "react";
import { Plus, Pencil } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { MiniStat } from "@/components/dashboard/cash-flow/mini-stat";
import {
  RowItem,
  type MoneyRow,
} from "@/components/dashboard/cash-flow/row-item";
import {
  RowDialog,
  type RowDraft,
} from "@/components/dashboard/cash-flow/row-dialog";
import {
  SettingsDialog,
  type CashFlowSettings,
} from "@/components/dashboard/cash-flow/settings-dialog";
import { CelereyInsights } from "@/components/dashboard/cash-flow/celerey-insights";
import { NetWorthCard } from "@/components/dashboard/cash-flow/net-worth-card";
import {
  DeleteConfirmDialog,
  type EditMode,
  type DeleteTarget,
} from "@/components/dashboard/cash-flow/delete-confirm-dialog";
import { cashFlowData } from "@/lib/client-data";
import { calculateNetWorth } from "@/lib/net-worth";

type RowMode = "create" | "edit";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(16).slice(2)}`;
}

export default function CashFlowPage() {
  // Initialize from client data lib
  const [income, setIncome] = React.useState<MoneyRow[]>(cashFlowData.income);
  const [expenses, setExpenses] = React.useState<MoneyRow[]>(
    cashFlowData.expenses,
  );
  const [settings, setSettings] = React.useState<CashFlowSettings>(
    cashFlowData.settings,
  );

  // dialogs
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const [rowDialogOpen, setRowDialogOpen] = React.useState(false);
  const [rowDialogType, setRowDialogType] = React.useState<EditMode>("income");
  const [rowDialogMode, setRowDialogMode] = React.useState<RowMode>("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [rowDraft, setRowDraft] = React.useState<RowDraft>({
    name: "",
    amount: "",
  });

  // delete confirm
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(
    null,
  );

  const totalIncome = React.useMemo(
    () => sum(income.map((i) => i.amount)),
    [income],
  );
  const totalExpenses = React.useMemo(
    () => sum(expenses.map((e) => e.amount)),
    [expenses],
  );

  const savings = React.useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );
  const savingsRate = React.useMemo(() => {
    if (totalIncome <= 0) return 0;
    return (savings / totalIncome) * 100;
  }, [savings, totalIncome]);

  // Net worth calculation based on all data sources
  const netWorth = React.useMemo(
    () =>
      calculateNetWorth(
        undefined, // holdings (default)
        undefined, // valuations (default)
        undefined, // properties (default)
        undefined, // insurance (default)
        income, // live income state
        expenses, // live expense state
      ),
    [income, expenses],
  );

  function openCreate(type: EditMode): void {
    setRowDialogType(type);
    setRowDialogMode("create");
    setEditingId(null);
    setRowDraft({ name: "", amount: "" });
    setRowDialogOpen(true);
  }

  function openEdit(type: EditMode, row: MoneyRow): void {
    setRowDialogType(type);
    setRowDialogMode("edit");
    setEditingId(row.id);
    setRowDraft({ name: row.name, amount: String(row.amount) });
    setRowDialogOpen(true);
  }

  function requestDelete(type: EditMode, row: MoneyRow): void {
    setDeleteTarget({ type, row });
    setDeleteOpen(true);
  }

  function confirmDelete(): void {
    if (!deleteTarget) return;

    if (deleteTarget.type === "income") {
      setIncome((prev) => prev.filter((x) => x.id !== deleteTarget.row.id));
    } else {
      setExpenses((prev) => prev.filter((x) => x.id !== deleteTarget.row.id));
    }

    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function submitRow(): void {
    const amountNum = Number(rowDraft.amount);
    const validAmount = Number.isFinite(amountNum) && amountNum >= 0;
    if (!rowDraft.name.trim() || !validAmount) return;

    const newRow: MoneyRow = {
      id: rowDialogMode === "edit" && editingId ? editingId : uid(),
      name: rowDraft.name.trim(),
      amount: Math.round(amountNum),
    };

    if (rowDialogType === "income") {
      setIncome((prev) => {
        if (rowDialogMode === "edit")
          return prev.map((r) => (r.id === newRow.id ? newRow : r));
        return [newRow, ...prev];
      });
    } else {
      setExpenses((prev) => {
        if (rowDialogMode === "edit")
          return prev.map((r) => (r.id === newRow.id ? newRow : r));
        return [newRow, ...prev];
      });
    }

    setRowDialogOpen(false);
    setRowDraft({ name: "", amount: "" });
    setEditingId(null);
  }

  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Cash Flow & Banking
            </h1>
            <p className="text-sm text-muted-foreground">
              Income, expenses, and savings optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit overview
            </Button>
            <Button onClick={() => openCreate("income")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add income
            </Button>
            <Button
              variant="outline"
              onClick={() => openCreate("expense")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </div>
        </div>

        {/* Top stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <MiniStat
            label="Net Worth"
            value={formatCurrency(netWorth.netWorth)}
            accent={netWorth.netWorth >= 0 ? "good" : undefined}
          />
          <MiniStat
            label="Monthly Income"
            value={formatCurrency(totalIncome)}
          />
          <MiniStat
            label="Monthly Expenses"
            value={formatCurrency(totalExpenses)}
          />
          <MiniStat
            label="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            accent={savingsRate >= 20 ? "good" : undefined}
          />
          <MiniStat
            label="Emergency Fund"
            value={`${settings.emergencyFundMonths} months`}
          />
        </div>

        {/* Net Worth + Income/Expenses */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Net worth breakdown */}
          <div className="lg:col-span-1">
            <NetWorthCard breakdown={netWorth} />
          </div>

          {/* Income + Expenses - side by side */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">
            {/* Income sources */}
            <Card className="border-muted/60 bg-background/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Income Sources</CardTitle>
                <Badge variant="secondary" className="tabular-nums">
                  {formatCurrency(totalIncome)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {income.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No income sources yet. Add one to start tracking.
                  </div>
                ) : (
                  income.map((r) => (
                    <RowItem
                      key={r.id}
                      row={r}
                      total={totalIncome}
                      onEdit={() => openEdit("income", r)}
                      onDelete={() => requestDelete("income", r)}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Expense breakdown */}
            <Card className="border-muted/60 bg-background/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Expense Breakdown</CardTitle>
                <Badge variant="secondary" className="tabular-nums">
                  {formatCurrency(totalExpenses)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No expenses yet. Add one to start tracking.
                  </div>
                ) : (
                  expenses.map((r) => (
                    <RowItem
                      key={r.id}
                      row={r}
                      total={totalExpenses}
                      onEdit={() => openEdit("expense", r)}
                      onDelete={() => requestDelete("expense", r)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Celerey insights */}
        <CelereyInsights />
      </div>

      {/* Dialogs */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        setSettings={setSettings}
      />

      <RowDialog
        open={rowDialogOpen}
        onOpenChange={setRowDialogOpen}
        title={
          rowDialogMode === "create"
            ? rowDialogType === "income"
              ? "Add income source"
              : "Add expense"
            : rowDialogType === "income"
              ? "Edit income source"
              : "Edit expense"
        }
        submitLabel={rowDialogMode === "create" ? "Add" : "Save"}
        draft={rowDraft}
        setDraft={setRowDraft}
        onSubmit={submitRow}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={deleteTarget}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
