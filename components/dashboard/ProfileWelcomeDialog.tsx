"use client";

import React from "react";
import { UserCog } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useFinancialStore } from "@/store/financialStore";
import { useProfilePanel } from "./ProfilePanelContext";

/**
 * Welcome dialog shown the first time a user lands on the dashboard after
 * login. Nudges them to finish profile setup but is dismissable. "Start" opens
 * the existing profile setup side panel.
 */
export function ProfileWelcomeDialog() {
  const { welcomeOpen, dismissWelcome, open: openPanel } = useProfilePanel();
  const score = useFinancialStore((s) => s.profileCompletionScore);
  const displayName = useFinancialStore((s) => s.user?.display_name);

  // Already complete - nothing to nudge about.
  if (score >= 100) return null;

  const firstName = displayName?.split(" ")[0] ?? "there";

  function handleStart() {
    dismissWelcome();
    openPanel();
  }

  return (
    <Dialog
      open={welcomeOpen}
      onOpenChange={(open) => {
        if (!open) dismissWelcome();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
        
          <DialogTitle className=" py-3">Welcome, {firstName}</DialogTitle>
          <DialogDescription>
            Your profile is {score}% complete. Finish a few more steps to unlock
            sharper insights, tailored recommendations, and a more accurate
            financial picture.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Profile completion</span>
            <span className="tabular-nums">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={dismissWelcome}
            className="sm:order-1"
          >
            Maybe later
          </Button>
          <Button onClick={handleStart} className="sm:order-2">
            Complete profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
