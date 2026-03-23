"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { propertyEquity } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

export type TabKey = "buy_vs_rent" | "refinancing" | "portfolio_impact";

// ── formatting helpers ────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const pct = (n: number) => `${n.toFixed(1)}%`;

// Approximate prevailing 30-yr fixed mortgage rate (2026)
const MARKET_RATE_PCT = 5.75;

// ── Buy vs Rent ───────────────────────────────────────────────────────────────

function BuyVsRent() {
  const properties = useFinancialStore((s) => s.propertyAssets);
  const storeLiabilities = useFinancialStore((s) => s.liabilities);
  const primary = properties.find(
    (p) => p.is_primary && p.is_active && p.country !== "",
  );
  const mortgage = storeLiabilities.find((l) => l.type === "mortgage");

  if (!primary || !mortgage) return null;

  const monthlyMortgage = mortgage.minPaymentMonthly;
  const monthlyInsurance = primary.insurance.reduce(
    (s, i) => s + i.annual_premium / 12,
    0,
  );
  const monthlyTax = (primary.market_value * 0.012) / 12; // 1.2% effective annual rate
  const monthlyMaintenance = (primary.market_value * 0.01) / 12; // 1% rule
  const totalOwn =
    monthlyMortgage + monthlyInsurance + monthlyTax + monthlyMaintenance;
  const estimatedRent = primary.market_value * 0.004; // 0.4%/mo of value
  const monthlyEquityBuild = monthlyMortgage * 0.35; // ~35% of payment builds equity

  const rows = [
    { label: "Mortgage payment", own: monthlyMortgage, rent: null },
    { label: "Insurance", own: monthlyInsurance, rent: null },
    { label: "Property tax (est.)", own: monthlyTax, rent: null },
    { label: "Maintenance (est.)", own: monthlyMaintenance, rent: null },
    { label: "Market rent (est.)", own: null, rent: estimatedRent },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-x-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide pb-1">
        <span>Item</span>
        <span className="text-right">Own</span>
        <span className="text-right">Rent</span>
      </div>

      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-3 gap-x-2 text-xs">
          <span className="text-muted-foreground">{r.label}</span>
          <span className="text-right font-medium">
            {r.own != null ? fmt(r.own) : "—"}
          </span>
          <span className="text-right font-medium">
            {r.rent != null ? fmt(r.rent) : "—"}
          </span>
        </div>
      ))}

      <Separator />

      <div className="grid grid-cols-3 gap-x-2 text-xs font-semibold">
        <span>Total / mo</span>
        <span className="text-right">{fmt(totalOwn)}</span>
        <span className="text-right">{fmt(estimatedRent)}</span>
      </div>

      <p className="text-[11px] text-muted-foreground pt-1">
        Owning costs {fmt(totalOwn - estimatedRent)}/mo more than renting, but
        builds ~{fmt(monthlyEquityBuild)}/mo in equity on {primary.name}.
      </p>
    </div>
  );
}

// ── Refinancing ───────────────────────────────────────────────────────────────

function RefinancingOptions() {
  const storeLiabilities = useFinancialStore((s) => s.liabilities);
  const mortgages = storeLiabilities.filter((l) => l.type === "mortgage");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-x-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide pb-1">
        <span>Loan</span>
        <span className="text-right">Current</span>
        <span className="text-right">Market</span>
      </div>

      {mortgages.map((m) => {
        const beneficial = MARKET_RATE_PCT - m.interestRatePct < -0.5;
        return (
          <div key={m.id} className="space-y-0.5">
            <div className="grid grid-cols-3 gap-x-2 text-xs">
              <span className="text-muted-foreground truncate">
                {m.name.replace(" Mortgage", "")}
              </span>
              <span className="text-right font-medium text-green-600">
                {pct(m.interestRatePct)}
              </span>
              <span className="text-right font-medium">
                {pct(MARKET_RATE_PCT)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Balance: {fmt(m.balance)} ·{" "}
              {beneficial ? "Consider refinancing" : "Below market — hold"}
            </p>
          </div>
        );
      })}

      <Separator />

      <p className="text-[11px] text-muted-foreground">
        Both mortgages are locked in below the current market rate of{" "}
        {pct(MARKET_RATE_PCT)}. Refinancing would increase monthly payments —
        hold existing terms.
      </p>
    </div>
  );
}

// ── Portfolio Impact ──────────────────────────────────────────────────────────

function PortfolioImpact() {
  const properties = useFinancialStore((s) => s.propertyAssets);
  const storeLiabilities = useFinancialStore((s) => s.liabilities);
  const storePortfolioPerformance = useFinancialStore(
    (s) => s.portfolioPerformance,
  );
  const storeEmergencyFund = useFinancialStore((s) => s.emergencyFund);
  const active = properties.filter((p) => p.is_active && p.country !== "");
  const totalMarketValue = active.reduce((s, p) => s + p.market_value, 0);
  const totalEquity = active.reduce((s, p) => s + propertyEquity(p), 0);
  const investmentValue = storePortfolioPerformance.at(-1)?.value ?? 0;
  const cash = storeEmergencyFund.currentCashBalance;
  const otherLiabilities = storeLiabilities
    .filter((l) => l.type !== "mortgage")
    .reduce((s, l) => s + l.balance, 0);
  const totalNetWorth = totalEquity + investmentValue + cash - otherLiabilities;
  const concentrationPct =
    totalNetWorth > 0 ? (totalEquity / totalNetWorth) * 100 : 0;
  const highConcentration = concentrationPct > 50;

  const rows = [
    { label: "Active properties", value: String(active.length) },
    { label: "Total market value", value: fmt(totalMarketValue) },
    { label: "Total equity", value: fmt(totalEquity) },
    { label: "Investment portfolio", value: fmt(investmentValue) },
    { label: "Est. net worth", value: fmt(totalNetWorth) },
    { label: "Property concentration", value: pct(concentrationPct) },
  ];

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between text-xs">
          <span className="text-muted-foreground">{r.label}</span>
          <span
            className={cn(
              "font-medium",
              r.label === "Property concentration" && highConcentration
                ? "text-amber-600"
                : "",
            )}
          >
            {r.value}
          </span>
        </div>
      ))}

      <Separator />

      <p className="text-[11px] text-muted-foreground">
        {highConcentration
          ? `Property equity is ${pct(concentrationPct)} of net worth — above the 50% threshold. Consider diversifying into liquid assets.`
          : `Property concentration is within a healthy range at ${pct(concentrationPct)} of net worth.`}
      </p>
    </div>
  );
}

// ── Pill Tabs ─────────────────────────────────────────────────────────────────

function PillTabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  const items: { key: TabKey; label: string }[] = [
    { key: "buy_vs_rent", label: "Buy vs Rent" },
    { key: "refinancing", label: "Refinancing" },
    { key: "portfolio_impact", label: "Portfolio Impact" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => {
        const active = value === t.key;
        return (
          <Button
            key={t.key}
            type="button"
            size="sm"
            variant={active ? "default" : "secondary"}
            className={cn(
              "rounded-full h-7 px-3 text-xs",
              active ? "" : "bg-muted/60 text-foreground hover:bg-muted",
            )}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PropertyAnalysis() {
  const [tab, setTab] = React.useState<TabKey>("buy_vs_rent");

  return (
    <DashCard className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Property Analysis</CardTitle>
        <p className="text-xs text-muted-foreground">
          Quick lenses to evaluate property decisions.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <PillTabs value={tab} onChange={setTab} />

        <Separator />

        {tab === "buy_vs_rent" && <BuyVsRent />}
        {tab === "refinancing" && <RefinancingOptions />}
        {tab === "portfolio_impact" && <PortfolioImpact />}
      </CardContent>
    </DashCard>
  );
}
