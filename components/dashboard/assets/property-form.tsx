"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lightbulb, Home } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Property,
  type PropertyType,
  PROPERTY_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
} from "@/lib/property-data";

// ── Form state ──────────────────────────────────────────────────
export type PropertyFormValues = {
  name: string;
  propertyType: PropertyType;
  country: string;
  city: string;
  purchaseDate: string;
  marketValue: string;
  mortgageBalance: string;
  isPrimary: boolean;
};

export type PropertyFormProps = {
  editingProperty?: Property;
  title?: string;
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
export function PropertyForm({
  editingProperty,
  title,
  subtitle,
}: PropertyFormProps) {
  const router = useRouter();
  const isEditing = !!editingProperty;

  const [form, setForm] = React.useState<PropertyFormValues>(() => {
    if (editingProperty) {
      return {
        name: editingProperty.name,
        propertyType: editingProperty.property_type as PropertyType,
        country: editingProperty.country,
        city: editingProperty.city,
        purchaseDate: editingProperty.purchase_date,
        marketValue: formatNumberWithCommas(
          editingProperty.market_value.toString(),
        ),
        mortgageBalance: formatNumberWithCommas(
          editingProperty.mortgage_balance.toString(),
        ),
        isPrimary: editingProperty.is_primary,
      };
    }
    return {
      name: "",
      propertyType: "house",
      country: "",
      city: "",
      purchaseDate: "",
      marketValue: "",
      mortgageBalance: "",
      isPrimary: false,
    };
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // ── Updater ─────────────────────────────────────────────────
  function update<K extends keyof PropertyFormValues>(
    key: K,
    value: PropertyFormValues[K],
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMoneyInput(
    key: "marketValue" | "mortgageBalance",
    value: string,
  ): void {
    update(key, formatNumberWithCommas(value));
  }

  // ── Derived values ──────────────────────────────────────────
  const marketValueNum = toNumber(form.marketValue);
  const mortgageNum = toNumber(form.mortgageBalance);
  const equity = marketValueNum - mortgageNum;
  const lvr =
    marketValueNum > 0 ? Math.round((mortgageNum / marketValueNum) * 100) : 0;

  // ── Contextual insight ──────────────────────────────────────
  type Insight = { tone: "info" | "good" | "warn"; message: string };

  const insight: Insight = React.useMemo(() => {
    if (!form.name.trim() || marketValueNum <= 0) {
      return {
        tone: "info",
        message:
          "Fill in the details to see how this property fits your portfolio.",
      };
    }
    if (lvr > 80) {
      return {
        tone: "warn",
        message: `An LVR of ${lvr}% is high. You may be paying lenders mortgage insurance (LMI). Consider increasing your equity position.`,
      };
    }
    if (lvr > 60) {
      return {
        tone: "info",
        message: `Your LVR is ${lvr}%. You have ${currency(equity)} in equity - consider if refinancing could improve your rate.`,
      };
    }
    if (mortgageNum === 0 && marketValueNum > 0) {
      return {
        tone: "good",
        message: `This property is fully paid off with ${currency(marketValueNum)} in equity. Great position!`,
      };
    }
    return {
      tone: "good",
      message: `Healthy LVR of ${lvr}% with ${currency(equity)} in equity.`,
    };
  }, [form.name, marketValueNum, mortgageNum, lvr, equity]);

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
    form.country.length > 0 &&
    form.city.trim().length > 0 &&
    marketValueNum > 0 &&
    form.purchaseDate.length > 0;

  // ── Submit ──────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...(editingProperty
          ? { property_id: editingProperty.property_id }
          : {}),
        name: form.name.trim(),
        property_type: form.propertyType,
        country: form.country,
        city: form.city.trim(),
        purchase_date: form.purchaseDate,
        market_value: marketValueNum,
        mortgage_balance: mortgageNum,
        is_primary: form.isPrimary,
      };

      console.log(isEditing ? "Update property:" : "New property:", payload);

      router.push("/dashboard/properties");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────
  const formTitle = title ?? (isEditing ? "Edit property" : "Add a property");
  const formSubtitle =
    subtitle ??
    (isEditing
      ? `Update the details for ${editingProperty!.name}.`
      : "Track a new real estate holding.");

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
              <CardTitle className="text-base">Property details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tell us about the property; we&apos;ll help you track it.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Property name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Primary Residence, Rental Unit, Beach House"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              <Separator />

              {/* Type + Primary toggle */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="property-type">Property type</Label>
                  <Select
                    value={form.propertyType}
                    onValueChange={(v) =>
                      update("propertyType", v as PropertyType)
                    }
                  >
                    <SelectTrigger id="property-type" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary residence</Label>
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      checked={form.isPrimary}
                      onCheckedChange={(checked) =>
                        update("isPrimary", checked)
                      }
                    />
                    <span className="text-sm">
                      {form.isPrimary ? "Yes" : "No"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your main home, this affects tax and planning calculations.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => update("country", v)}
                  >
                    <SelectTrigger id="country" className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. New York, Sydney, Accra"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Financials */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="market-value">Market value</Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      $
                    </div>
                    <Input
                      id="market-value"
                      type="text"
                      inputMode="numeric"
                      placeholder="850,000"
                      value={form.marketValue}
                      onChange={(e) =>
                        handleMoneyInput("marketValue", e.target.value)
                      }
                      className="pl-7"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current estimated market value.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mortgage">Mortgage balance</Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      $
                    </div>
                    <Input
                      id="mortgage"
                      type="text"
                      inputMode="numeric"
                      placeholder="450,000"
                      value={form.mortgageBalance}
                      onChange={(e) =>
                        handleMoneyInput("mortgageBalance", e.target.value)
                      }
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty or 0 if fully paid off.
                  </p>
                </div>
              </div>

              {/* Equity / LVR preview */}
              {marketValueNum > 0 && (
                <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>
                      Equity:{" "}
                      <span className="font-medium text-foreground">
                        {currency(equity)}
                      </span>
                    </span>
                    <span>
                      LVR:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          lvr > 80
                            ? "text-rose-600 dark:text-rose-400"
                            : lvr > 60
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground",
                        )}
                      >
                        {lvr}%
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Purchase date */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Purchase date</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => update("purchaseDate", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    When you purchased or settled on this property.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard/properties")}
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
                    ? "Saving\u2026"
                    : isEditing
                      ? "Save changes"
                      : "Add property"}
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
                    value={form.name.trim() || "\u2014"}
                    truncate
                  />
                  <SummaryRow
                    label="Type"
                    value={
                      PROPERTY_TYPE_OPTIONS.find(
                        (o) => o.value === form.propertyType,
                      )?.label ?? "\u2014"
                    }
                  />
                  <SummaryRow
                    label="Location"
                    value={
                      form.city && form.country
                        ? `${form.city}, ${form.country}`
                        : "\u2014"
                    }
                  />

                  <Separator />

                  <SummaryRow
                    label="Market Value"
                    value={
                      marketValueNum > 0 ? currency(marketValueNum) : "\u2014"
                    }
                  />
                  <SummaryRow
                    label="Mortgage"
                    value={
                      mortgageNum > 0
                        ? currency(mortgageNum)
                        : marketValueNum > 0
                          ? "Paid off"
                          : "\u2014"
                    }
                  />
                  <SummaryRow
                    label="Equity"
                    value={marketValueNum > 0 ? currency(equity) : "\u2014"}
                  />
                  <SummaryRow
                    label="LVR"
                    value={marketValueNum > 0 ? `${lvr}%` : "\u2014"}
                  />

                  <Separator />

                  <div className="flex items-center gap-2">
                    <Home className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {form.isPrimary
                        ? "Primary residence"
                        : "Investment property"}
                    </span>
                  </div>

                  <SummaryRow
                    label="Purchased"
                    value={form.purchaseDate || "\u2014"}
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
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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
