"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type CashFlowSettings = {
  emergencyFundMonths: number;
};

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  setSettings,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  settings: CashFlowSettings;
  setSettings: (s: CashFlowSettings) => void;
}) {
  const [draft, setDraft] = React.useState<{ emergencyFundMonths: string }>({
    emergencyFundMonths: String(settings.emergencyFundMonths),
  });

  React.useEffect(() => {
    if (!open) return;
    setDraft({ emergencyFundMonths: String(settings.emergencyFundMonths) });
  }, [open, settings.emergencyFundMonths]);

  const monthsNum = Number(draft.emergencyFundMonths);
  const valid = Number.isFinite(monthsNum) && monthsNum >= 0 && monthsNum <= 36;

  function save(): void {
    if (!valid) return;
    setSettings({ emergencyFundMonths: Math.round(monthsNum) });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Cash Flow Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="efm">Emergency fund (months)</Label>
            <Input
              id="efm"
              type="number"
              min={0}
              max={36}
              value={draft.emergencyFundMonths}
              onChange={(e) =>
                setDraft({ emergencyFundMonths: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Used for the overview card. (0–36 months)
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={!valid}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
