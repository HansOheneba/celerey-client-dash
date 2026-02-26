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
import { Sparkles } from "lucide-react";

import RiskAttitudeQuiz from "@/components/dashboard/risk/quiz";

type Answer = "A" | "B" | "C" | "D";
type RiskBand =
  | "Very Conservative"
  | "Moderately Conservative"
  | "Moderate Growth"
  | "Aggressive / High Risk";

type RiskResult = {
  score: number;
  band: RiskBand;
  answers: Record<number, Answer>;
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
        desc: "Take 6 quick questions to understand your investment comfort level.",
        button: "Take quiz",
      };
    }

    return {
      title: "Your risk attitude",
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
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground">
              </div>
              <CardTitle className="text-base">{header.title}</CardTitle>
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
          <p className="text-sm text-muted-foreground">{header.desc}</p>

          {result ? (
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Current band</div>
              <div className="text-sm font-semibold mt-1">{result.band}</div>
              {/* <div className="text-xs text-muted-foreground mt-1">
                Score: {result.score} / 24
              </div> */}
            </div>
          ) : (
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-sm font-semibold mt-1">
                Not completed yet
              </div>
              <div className="text-xs text-muted-foreground mt-1">
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
        <DialogContent className=" p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Risk attitude</DialogTitle>
            <DialogDescription>
              Answer honestly. There are no right or wrong answers.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[85vh] overflow-auto">
            <RiskAttitudeQuiz onSave={handleSave} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
