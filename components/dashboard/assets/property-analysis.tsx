"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type TabKey = "buy_vs_rent" | "refinancing" | "portfolio_impact";

function PillTabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  const items: { key: TabKey; label: string }[] = [
    { key: "buy_vs_rent", label: "Buy vs Rent Analysis" },
    { key: "refinancing", label: "Refinancing Options" },
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
            variant={active ? "default" : "secondary"}
            className={cn(
              "rounded-full",
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

export function PropertyAnalysis() {
  const [tab, setTab] = React.useState<TabKey>("buy_vs_rent");

  return (
    <Card className="mt-6 border-muted/60 bg-background/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">AI Property Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick lenses to evaluate property decisions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <PillTabs value={tab} onChange={setTab} />

        <Separator />

        {tab === "buy_vs_rent" ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Buy vs Rent Analysis</div>
            <p className="text-sm text-muted-foreground">
              Compare ownership costs against renting, factoring interest rates,
              maintenance, taxes, and expected appreciation.
            </p>
          </div>
        ) : null}

        {tab === "refinancing" ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Refinancing Options</div>
            <p className="text-sm text-muted-foreground">
              Evaluate refinancing thresholds and potential savings based on
              current rates, loan terms, and fees.
            </p>
          </div>
        ) : null}

        {tab === "portfolio_impact" ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Portfolio Impact</div>
            <p className="text-sm text-muted-foreground">
              Estimate concentration risk and liquidity impact when property
              forms a large percentage of total net worth.
            </p>
          </div>
        ) : null}

        <div className="pt-1 text-xs text-muted-foreground">
          These panels are placeholders — plug in your analysis logic later.
        </div>
      </CardContent>
    </Card>
  );
}
