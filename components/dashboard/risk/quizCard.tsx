// components/dashboard/risk/quizCard.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import RiskAttitudeQuiz from "@/components/dashboard/risk/quiz";

type OptionScore = 1 | 2 | 3 | 4 | 5;
type RiskBand =
  | "Capital Preservation"
  | "Conservative"
  | "Balanced"
  | "Growth"
  | "Aggressive";

type RiskResult = {
  score: number;
  band: RiskBand;
  answers: Record<number, OptionScore>;
};

const STORAGE_KEY = "risk_attitude_result_v1";

function safeParseResult(raw: string | null): RiskResult | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RiskResult;
  } catch {
    return null;
  }
}

export default function QuizCard() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

  useEffect(() => {
    const saved = safeParseResult(localStorage.getItem(STORAGE_KEY));
    if (saved) setResult(saved);
  }, []);

  const header = useMemo(() => {
    if (!result) {
      return {
        title: "Risk attitude quiz",
        desc: "Take 10 quick questions to understand your investment comfort level.",
        button: "Take quiz",
      };
    }

    return {
      title: "Your risk attitude",
      desc: "Retake the quiz any time to update your profile.",
      button: "Retake test",
    };
  }, [result]);

  const handleSave = (next: RiskResult) => {
    setResult(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setOpen(false);
  };

  const handlePrimary = () => {
    if (result) {
      localStorage.removeItem(STORAGE_KEY);
      setResult(null);
    }
    setOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{header.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {header.desc}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => setOpen(true)}
            >
              View
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {result ? (
            <div className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Risk profile
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {result.band}
                  </div>
                </div>
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

          <Button className="w-full justify-between" onClick={handlePrimary}>
            {header.button}
            <span aria-hidden>→</span>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={`
            p-0 overflow-hidden
            w-[calc(100vw-24px)] sm:w-[calc(100vw-48px)]
            max-w-36
            h-[92vh] sm:h-[88vh]
          `}
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Risk attitude</DialogTitle>
            <DialogDescription>
              Answer honestly. There are no right or wrong answers.
            </DialogDescription>
          </DialogHeader>

          <div className="h-[calc(92vh-92px)] sm:h-[calc(88vh-92px)] overflow-auto">
            <RiskAttitudeQuiz onSave={handleSave} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
