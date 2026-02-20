"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AssetType,
  type AssetHolding,
  ASSET_TYPE_OPTIONS,
  supportsMarket,
  symbolsForType,
  isSymbolHeld,
  mockHoldings,
} from "@/lib/asset-data";

// ── Form state ──────────────────────────────────────────────────
export type HoldingFormValues = {
  name: string;
  assetType: AssetType;
  symbol: string;
  quantity: string;
  averageCost: string;
  initialValue: string;
  initialValueDate: string;
};

export type HoldingFormProps = {
  /** When set, the form is in edit mode */
  editingHolding?: AssetHolding;
  /** Page title override */
  title?: string;
  /** Subtitle override */
  subtitle?: string;
};

// ── Helpers ─────────────────────────────────────────────────────
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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

function currency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Component ───────────────────────────────────────────────────
export function HoldingForm({
  editingHolding,
  title,
  subtitle,
}: HoldingFormProps) {
  const router = useRouter();
  const isEditing = !!editingHolding;

  // ── Initialise form ─────────────────────────────────────────
  const [form, setForm] = React.useState<HoldingFormValues>(() => {
    if (editingHolding) {
      return {
        name: editingHolding.name,
        assetType: editingHolding.asset_type,
        symbol: editingHolding.symbol ?? "",
        quantity: editingHolding.quantity?.toString() ?? "",
        averageCost: editingHolding.average_cost
          ? formatNumberWithCommas(editingHolding.average_cost.toString())
          : "",
        initialValue: formatNumberWithCommas(
          editingHolding.initial_value.toString(),
        ),
        initialValueDate: editingHolding.initial_value_date,
      };
    }
    return {
      name: "",
      assetType: "stock",
      symbol: "",
      quantity: "",
      averageCost: "",
      initialValue: "",
      initialValueDate: new Date().toISOString().slice(0, 10),
    };
  });

  const [symbolSearch, setSymbolSearch] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // ── Derived ─────────────────────────────────────────────────
  const isMarket = supportsMarket(form.assetType);
  const quantityNum = toNumber(form.quantity);
  const avgCostNum = toNumber(form.averageCost);
  const initialValueNum = toNumber(form.initialValue);

  // Get symbols for the current asset type, filter by search
  const availableSymbols = React.useMemo(() => {
    const syms = symbolsForType(form.assetType);
    if (!symbolSearch.trim()) return syms;
    const q = symbolSearch.trim().toLowerCase();
    return syms.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }, [form.assetType, symbolSearch]);

  // Duplicate detection
  const isDuplicate = React.useMemo(() => {
    if (!form.symbol) return false;
    return isSymbolHeld(form.symbol, mockHoldings, editingHolding?.holding_id);
  }, [form.symbol, editingHolding?.holding_id]);

  // ── Updater ─────────────────────────────────────────────────
  function update<K extends keyof HoldingFormValues>(
    key: K,
    value: HoldingFormValues[K],
  ): void {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "assetType") {
        const at = value as AssetType;
        // Reset market fields when switching to manual type
        if (!supportsMarket(at)) {
          next.symbol = "";
          next.quantity = "";
          next.averageCost = "";
        } else {
          // Switching to a market type - clear previous symbol if it doesn&apos;t match
          const validForType = symbolsForType(at).some(
            (s) => s.symbol === next.symbol,
          );
          if (!validForType) {
            next.symbol = "";
            next.name = "";
          }
        }
        setSymbolSearch("");
      }
      return next;
    });
  }

  function selectSymbol(sym: string): void {
    const info = symbolsForType(form.assetType).find((s) => s.symbol === sym);
    setForm((prev) => ({
      ...prev,
      symbol: sym,
      name: info?.name ?? prev.name,
    }));
    setSymbolSearch("");
  }

  function handleMoneyInput(
    key: "averageCost" | "initialValue",
    value: string,
  ): void {
    update(key, formatNumberWithCommas(value));
  }

  // ── Computed initial value ──────────────────────────────────
  const computedInitialValue = React.useMemo(() => {
    if (isMarket && quantityNum > 0 && avgCostNum > 0) {
      return quantityNum * avgCostNum;
    }
    return initialValueNum;
  }, [isMarket, quantityNum, avgCostNum, initialValueNum]);

  // ── Contextual insight ──────────────────────────────────────
  type Insight = { tone: "info" | "good" | "warn"; message: string };

  const insight: Insight = React.useMemo(() => {
    if (isDuplicate) {
      return {
        tone: "warn",
        message: `You already own ${form.symbol}. Edit the existing holding instead of adding a duplicate.`,
      };
    }
    if (isMarket && !form.symbol) {
      return {
        tone: "info",
        message:
          "Pick a symbol so we can automatically track pricing for this holding.",
      };
    }
    if (!form.name.trim() && !isMarket) {
      return {
        tone: "info",
        message:
          "Fill in the details to see how this holding fits your portfolio.",
      };
    }
    if (computedInitialValue <= 0) {
      return {
        tone: "info",
        message: "Enter the value or cost basis to preview this holding.",
      };
    }
    if (computedInitialValue > 500_000) {
      return {
        tone: "warn",
        message: `A single position worth ${currency(computedInitialValue)} is significant. Make sure this doesn\u2019t create too much concentration risk.`,
      };
    }
    return {
      tone: "good",
      message: isMarket
        ? `We\u2019ll automatically update the valuation for ${form.symbol} using market prices.`
        : `This holding will be tracked with manual valuations starting from ${currency(computedInitialValue)}.`,
    };
  }, [isDuplicate, form.symbol, form.name, computedInitialValue, isMarket]);

  const insightClasses = React.useMemo(() => {
    switch (insight.tone) {
      case "good":
        return "border-sky-500/20 bg-sky-500/5 text-sky-800 dark:text-sky-300";
      case "warn":
        return "border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300";
      default:
        return "border-muted bg-muted/20 text-muted-foreground";
    }
  }, [insight.tone]);

  // ── Validation ──────────────────────────────────────────────
  const isValid =
    form.name.trim().length > 0 &&
    computedInitialValue > 0 &&
    form.initialValueDate.length > 0 &&
    (!isMarket || form.symbol.trim().length > 0) &&
    !isDuplicate;

  // ── Submit ──────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...(editingHolding ? { holding_id: editingHolding.holding_id } : {}),
        name: form.name.trim(),
        asset_type: form.assetType,
        valuation_method: isMarket ? ("market" as const) : ("manual" as const),
        symbol: form.symbol.trim() || undefined,
        quantity: isMarket ? quantityNum : undefined,
        average_cost: isMarket ? avgCostNum : undefined,
        initial_value: computedInitialValue,
        initial_value_date: form.initialValueDate,
      };

      console.log(isEditing ? "Update holding:" : "New holding:", payload);

      // API call placeholder:
      // const method = isEditing ? "PUT" : "POST";
      // const url = isEditing
      //   ? `/api/holdings/${editingHolding!.holding_id}`
      //   : "/api/holdings";
      // await fetch(url, {
      //   method,
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      router.push("/dashboard/assets");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────
  const formTitle = title ?? (isEditing ? "Edit holding" : "Add a holding");
  const formSubtitle =
    subtitle ??
    (isEditing
      ? `Update the details for ${editingHolding!.name}.`
      : "Track a new investment or asset position.");

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {formTitle}
              </h1>
              <p className="text-sm text-muted-foreground">{formSubtitle}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* ── Left: main form ───────────────────────────────── */}
          <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur lg:col-span-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Holding details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tell us what you own; we&apos;ll handle the tracking.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Asset type */}
              <div className="space-y-2">
                <Label htmlFor="asset-type">Asset type</Label>
                <Select
                  value={form.assetType}
                  onValueChange={(v) => update("assetType", v as AssetType)}
                >
                  <SelectTrigger id="asset-type" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {isMarket
                    ? "We\u2019ll automatically pull market prices for this type."
                    : "You\u2019ll update the valuation manually for this type."}
                </p>
              </div>

              <Separator />

              {/* ── Market-priced asset: symbol picker ─────── */}
              {isMarket && (
                <>
                  <div className="space-y-3">
                    <Label>Symbol</Label>

                    {/* Search filter */}
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or ticker…"
                        value={symbolSearch}
                        onChange={(e) => setSymbolSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Symbol grid */}
                    <div className="max-h-48 overflow-y-auto rounded-xl border bg-muted/10 p-2">
                      {availableSymbols.length === 0 ? (
                        <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                          No matching symbols. Try a different search.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                          {availableSymbols.map((s) => {
                            const selected = form.symbol === s.symbol;
                            const alreadyOwned = isSymbolHeld(
                              s.symbol,
                              mockHoldings,
                              editingHolding?.holding_id,
                            );
                            return (
                              <button
                                key={s.symbol}
                                type="button"
                                disabled={alreadyOwned}
                                onClick={() => selectSymbol(s.symbol)}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                  selected &&
                                    "bg-primary/10 ring-1 ring-primary/40",
                                  !selected &&
                                    !alreadyOwned &&
                                    "hover:bg-muted/40",
                                  alreadyOwned &&
                                    "cursor-not-allowed opacity-40",
                                )}
                              >
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 text-xs font-mono"
                                >
                                  {s.symbol}
                                </Badge>
                                <span className="truncate text-xs">
                                  {s.name}
                                </span>
                                {alreadyOwned && (
                                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                                    owned
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Duplicate warning */}
                    {isDuplicate && (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        You already hold {form.symbol}. Edit the existing
                        position instead.
                      </div>
                    )}
                  </div>

                  <Separator />
                </>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {isMarket ? "Display name" : "Holding name"}
                </Label>
                <Input
                  id="name"
                  placeholder={
                    isMarket
                      ? "Auto-filled from symbol"
                      : "e.g. Government Bond Portfolio, High-Yield Savings"
                  }
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
                {isMarket && (
                  <p className="text-xs text-muted-foreground">
                    Filled automatically when you pick a symbol. You can
                    customise it.
                  </p>
                )}
              </div>

              <Separator />

              {/* ── Market: quantity + avg cost ─────────────── */}
              {isMarket && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="text"
                        inputMode="decimal"
                        placeholder="200"
                        value={form.quantity}
                        onChange={(e) => update("quantity", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of shares or units you own.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avg-cost">Average cost per unit</Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                          $
                        </div>
                        <Input
                          id="avg-cost"
                          type="text"
                          inputMode="numeric"
                          placeholder="150"
                          value={form.averageCost}
                          onChange={(e) =>
                            handleMoneyInput("averageCost", e.target.value)
                          }
                          className="pl-7"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        What you paid on average per share.
                      </p>
                    </div>
                  </div>

                  {quantityNum > 0 && avgCostNum > 0 && (
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                      Cost basis:{" "}
                      <span className="font-medium text-foreground">
                        {currency(quantityNum * avgCostNum)}
                      </span>{" "}
                      ({quantityNum.toLocaleString()} &times;{" "}
                      {currency(avgCostNum)})
                    </div>
                  )}

                  <Separator />
                </>
              )}

              {/* ── Manual: initial value ──────────────────── */}
              {!isMarket && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="initial-value">Initial value</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                        $
                      </div>
                      <Input
                        id="initial-value"
                        type="text"
                        inputMode="numeric"
                        placeholder="100,000"
                        value={form.initialValue}
                        onChange={(e) =>
                          handleMoneyInput("initialValue", e.target.value)
                        }
                        className="pl-7"
                        required={!isMarket}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The value when you acquired it, or as of today.
                    </p>
                  </div>

                  <Separator />
                </>
              )}

              {/* Date */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    {isMarket ? "Purchase date" : "As-of date"}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.initialValueDate}
                    onChange={(e) => update("initialValueDate", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {isMarket
                      ? "When you bought this position."
                      : "When was it acquired or last valued?"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard/assets")}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="sm:w-auto"
                >
                  {isSubmitting
                    ? "Saving…"
                    : isEditing
                      ? "Save changes"
                      : "Add holding"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Right: summary sidebar ────────────────────── */}
          <div className="space-y-6">
            <Card className="border-muted/60 bg-background/70 shadow-sm backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <SummaryRow
                    label="Name"
                    value={form.name.trim() || "-"}
                    truncate
                  />
                  <SummaryRow
                    label="Type"
                    value={
                      ASSET_TYPE_OPTIONS.find((o) => o.value === form.assetType)
                        ?.label ?? "-"
                    }
                  />
                  <SummaryRow
                    label="Pricing"
                    value={isMarket ? "Automatic" : "Manual"}
                  />

                  <Separator />

                  {isMarket && form.symbol && (
                    <SummaryRow label="Symbol" value={form.symbol} />
                  )}
                  {isMarket && quantityNum > 0 && (
                    <SummaryRow
                      label="Quantity"
                      value={quantityNum.toLocaleString()}
                    />
                  )}

                  <SummaryRow
                    label={isMarket ? "Cost Basis" : "Initial Value"}
                    value={
                      computedInitialValue > 0
                        ? currency(computedInitialValue)
                        : "-"
                    }
                  />
                  <SummaryRow
                    label={isMarket ? "Purchase Date" : "As-of Date"}
                    value={form.initialValueDate || "-"}
                  />
                </div>

                {/* Contextual guidance */}
                <div
                  className={cn(
                    "rounded-xl border p-3 text-xs leading-relaxed",
                    insightClasses,
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span>{insight.message}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Internal helper ─────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn("text-sm font-semibold", truncate && "truncate max-w-40")}
      >
        {value}
      </span>
    </div>
  );
}
