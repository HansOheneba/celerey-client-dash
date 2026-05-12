// components/dashboard/risk/quizCard.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="p-0 w-full sm:max-w-lg flex flex-col overflow-hidden"
        showCloseButton={true}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Risk attitude quiz</SheetTitle>
          <SheetDescription>
            Answer honestly. There are no right or wrong answers.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto">
          {submitting && (
            <div className="px-8 pt-6 text-sm text-muted-foreground">
              Submitting…
            </div>
          )}
          {submitError && (
            <div className="px-8 pt-6 text-sm text-red-500">{submitError}</div>
          )}
          {!submitting && (
            <RiskAttitudeQuiz
              onSave={({ responses }) =>
                handleSubmit(responses, () => onClose())
              }
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Card (used on the overview page) ────────────────────────────────────────

export default function QuizCard() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [resultLoading, setResultLoading] = useState(true);
  const { submitting, submitError, handleSubmit } = useRiskQuiz();

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

  const profileLabel = result
    ? (result.risk_profile ?? result.band ?? "Unknown")
    : null;

  return (
    <>
      <DashCard>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                {result ? "Your risk attitude" : "Risk attitude quiz"}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {result
                  ? "Retake the quiz any time to update your profile."
                  : "Take 10 quick questions to understand your investment comfort level."}
              </p>
            </div>

            {result && (
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={() => setOpen(true)}
              >
                View
              </Button>
            )}
          </div>
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
              <div className="mt-1 text-sm font-semibold">
                Not completed yet
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Complete it to tailor suggestions.
              </div>
            </div>
          )}

          {!resultLoading && (
            <Button
              className="w-full justify-between"
              onClick={() => setOpen(true)}
            >
              {result ? "Retake test" : "Take quiz"}
              <span aria-hidden>→</span>
            </Button>
          )}
        </CardContent>
      </DashCard>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="p-0 w-full sm:max-w-lg flex flex-col overflow-hidden"
          showCloseButton={true}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Risk attitude quiz</SheetTitle>
            <SheetDescription>
              Answer honestly. There are no right or wrong answers.
            </SheetDescription>
          </SheetHeader>

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
                  handleSubmit(responses, (r) => {
                    setResult(r);
                    setOpen(false);
                  })
                }
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
