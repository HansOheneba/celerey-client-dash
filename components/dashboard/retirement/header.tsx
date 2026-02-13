"use client";

import { Pencil, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type RetirementHeaderProps = {
  simulationMode: boolean;
  onToggleSimulation: (value: boolean) => void;
  onResetSimulation: () => void;
  onToggleEditActual: () => void;
};

export function RetirementHeader({
  simulationMode,
  onToggleSimulation,
  onResetSimulation,
  onToggleEditActual,
}: RetirementHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Retirement &amp; Future Projections
        </h1>
        <p className="text-sm text-muted-foreground">
          View your current plan, then explore scenarios with simulation.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-background/60 px-3 py-2 border border-muted/60">
            <Label className="text-xs text-muted-foreground">Simulation</Label>
            {simulationMode ? (
              <Button
                variant="secondary"
                className="gap-2"
                onClick={onResetSimulation}
                title="Reset simulation to match your actual figures"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset sim
              </Button>
            ) : null}
            <Switch
              checked={simulationMode}
              onCheckedChange={onToggleSimulation}
            />
            <Badge variant="secondary" className="tabular-nums">
              {simulationMode ? "On" : "Off"}
            </Badge>
          </div>
        </div>

        <Button
          variant="secondary"
          className="gap-2"
          onClick={onToggleEditActual}
        >
          <Pencil className="h-4 w-4" />
          Edit actuals
        </Button>
      </div>
    </div>
  );
}
