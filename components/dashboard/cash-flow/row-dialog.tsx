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

export type RowDraft = {
  name: string;
  amount: string; // keep as string for input
};

export function RowDialog({
  open,
  onOpenChange,
  title,
  submitLabel,
  draft,
  setDraft,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  submitLabel: string;
  draft: RowDraft;
  setDraft: (draft: RowDraft) => void;
  onSubmit: () => void;
}) {
  const amountNum = Number(draft.amount);
  const validAmount = Number.isFinite(amountNum) && amountNum >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="row_name">Name</Label>
            <Input
              id="row_name"
              value={draft.name}
              placeholder="e.g. Salary, Housing, Dividends"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="row_amount">Monthly amount</Label>
            <Input
              id="row_amount"
              type="number"
              value={draft.amount}
              placeholder="0"
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
            />
            {!validAmount ? (
              <p className="text-xs text-muted-foreground">
                Enter a valid amount (0 or more).
              </p>
            ) : null}
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
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!draft.name.trim() || !validAmount}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
