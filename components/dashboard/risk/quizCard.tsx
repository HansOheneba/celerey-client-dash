// components/dashboard/risk/quizCard.tsx
"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import { Skeleton } from "@/components/ui/skeleton";

import RiskAttitudeQuiz from "@/components/dashboard/risk/quiz";
import {
  fetchLatestRiskAssessment,
  submitRiskAssessment,
  type RiskAssessmentResult,
} from "@/lib/dashboard-api";
import { getAuth } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { useProfilePanel } from "@/components/dashboard/ProfilePanelContext";

// ─── Shared logic ─────────────────────────────────────────────────────────────

function useRiskQuiz() {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(
    responses: Record<string, number>,
    onSuccess: (result: RiskAssessmentResult) => void,
  ) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const submitted = await submitRiskAssessment({
        questionnaire_version: "1.0",
        responses,
      });
      if (submitted) {
        const riskProfile = submitted.risk_profile ?? submitted.band;
        if (riskProfile) {
          const storeUser = useFinancialStore.getState().user;
          if (storeUser) {
            useFinancialStore.getState().setUser({
              ...storeUser,
              risk_profile: riskProfile as any,
            });
          }
        }
        onSuccess(submitted);
      } else {
        setSubmitError("Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, submitError, handleSubmit };
}

// ─── Standalone dialog (used globally from the layout) ────────────────────────

export function RiskQuizDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { submitting, submitError, handleSubmit } = useRiskQuiz();
  const [everOpened, setEverOpened] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  function requestClose() {
    setConfirmOpen(true);
  }

  return (
    <>
      <DialogPrimitive.Root
        open={open}
        onOpenChange={(v) => {
          if (v) setEverOpened(true);
          // Block Radix's built-in close — we handle it via requestClose
        }}
      >
        <DialogPrimitive.Portal>
          {/* Backdrop */}
          <DialogPrimitive.Overlay
            forceMount
            onClick={requestClose}
            className={[
              "fixed inset-0 z-50 bg-black/50",
              open
                ? "animate-fade animate-duration-200"
                : everOpened
                  ? "animate-fade animate-reverse animate-duration-150 animate-fill-forwards pointer-events-none"
                  : "hidden",
            ].join(" ")}
          />

          {/* Panel */}
          <DialogPrimitive.Content
            forceMount
            aria-describedby={undefined}
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              requestClose();
            }}
            className={[
              "fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col overflow-hidden border-l bg-background shadow-lg outline-none sm:max-w-lg",
              open
                ? "animate-fade-left animate-duration-300 animate-ease-out"
                : everOpened
                  ? "animate-fade-left animate-reverse animate-duration-200 animate-ease-in animate-fill-forwards pointer-events-none"
                  : "hidden",
            ].join(" ")}
          >
            <DialogPrimitive.Title className="sr-only">
              Risk attitude quiz
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Answer honestly. There are no right or wrong answers.
            </DialogPrimitive.Description>

            {/* Close button */}
            <button
              type="button"
              onClick={requestClose}
              className="absolute right-4 top-4 z-10 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            >
              <XIcon className="h-4 w-4" />
            </button>

            <div className="flex-1 overflow-auto">
              {submitting && (
                <div className="px-8 pt-6 text-sm text-muted-foreground">
                  Submitting…
                </div>
              )}
              {submitError && (
                <div className="px-8 pt-6 text-sm text-red-500">
                  {submitError}
                </div>
              )}
              {!submitting && (
                <RiskAttitudeQuiz
                  onSave={({ responses }) =>
                    handleSubmit(responses, () => onClose())
                  }
                />
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Confirm exit */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit the quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress won&apos;t be saved. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => {
                setConfirmOpen(false);
                onClose();
              }}
            >
              Exit quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Card (used on the overview page) ────────────────────────────────────────

export default function QuizCard() {
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [resultLoading, setResultLoading] = useState(true);
  const { openRiskQuiz, riskQuizOpen } = useProfilePanel();
  const prevQuizOpen = useRef(false);

  useEffect(() => {
    if (!getAuth().loggedIn) {
      setResultLoading(false);
      return;
    }
    fetchLatestRiskAssessment()
      .then((r) => {
        if (r) setResult(r);
      })
      .finally(() => setResultLoading(false));
  }, []);

  // Re-fetch when the quiz panel closes in case the user submitted
  useEffect(() => {
    if (prevQuizOpen.current && !riskQuizOpen && getAuth().loggedIn) {
      fetchLatestRiskAssessment().then((r) => {
        if (r) setResult(r);
      });
    }
    prevQuizOpen.current = riskQuizOpen;
  }, [riskQuizOpen]);

  const profileLabel = result
    ? (result.risk_profile ?? result.band ?? "Unknown")
    : null;

  return (
    <DashCard>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {result ? "Your risk attitude" : "Risk attitude quiz"}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          {result
            ? "Retake the quiz any time to update your profile."
            : "Take 10 quick questions to understand your investment comfort level."}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {resultLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ) : result ? (
          <div className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">
                  Risk profile
                </div>
                <div className="mt-1 text-sm font-semibold capitalize">
                  {profileLabel}
                </div>
              </div>
              {typeof result.score === "number" && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Risk score
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {result.score.toFixed(1)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      / 5
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-1 text-sm font-semibold">Not completed yet</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Complete it to tailor suggestions.
            </div>
          </div>
        )}

        {!resultLoading && (
          <Button className="w-full justify-between" onClick={openRiskQuiz}>
            {result ? "Retake test" : "Take quiz"}
            <span aria-hidden>→</span>
          </Button>
        )}
      </CardContent>
    </DashCard>
  );
}
