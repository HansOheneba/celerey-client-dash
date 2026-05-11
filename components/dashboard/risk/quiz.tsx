"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft } from "lucide-react";
import type { RiskQuestion } from "@/lib/dashboard-api";

interface QuizProps {
  questions: RiskQuestion[];
  onSubmit: (responses: Record<string, number>) => void;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const OPTION_COLORS = [
  "bg-[#18163f]/10 text-[#18163f]",
  "bg-orange-100 text-orange-500",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-rose-100 text-rose-500",
  "bg-amber-100 text-amber-600",
];

export default function RiskAttitudeQuiz({ questions, onSubmit }: QuizProps) {
  const totalSteps = questions.length;
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = questions[step - 1];
  const currentId = currentQuestion?.id ?? `q${step}`;
  const selectedScore = answers[currentId];
  const canGoNext = selectedScore !== undefined;

  const progressPct = (step / totalSteps) * 100;

  function handleSelect(score: number) {
    setAnswers((prev) => ({ ...prev, [currentId]: score }));
  }

  function handlePrevious() {
    if (step <= 1) return;
    setStep((s) => s - 1);
  }

  function handleNext() {
    if (!canGoNext) return;
    if (step >= totalSteps) {
      onSubmit(answers);
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="flex flex-col bg-white px-6 py-8 min-h-full">
      {/* ── Progress bar ── */}
      <div className="mx-auto w-full my-5 max-w-lg">
        <div className="flex gap-2 h-1.5">
          {/* filled segment */}
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
          {/* remaining segment */}
          <div
            className="h-full rounded-full bg-gray-200 transition-all duration-300"
            style={{ width: `${100 - progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Question ── */}
      <div className="mx-auto w-full max-w-lg mt-10 flex-1">
        <h2 className="text-2xl md:text-[1.75rem] font-bold text-slate-900 text-center leading-snug">
          {currentQuestion?.question}
        </h2>
        <p className="mt-2.5 text-center text-sm text-slate-500">
          Please select one option, you can always retake the quiz later.
        </p>

        {/* ── Options ── */}
        <div className="mt-8 space-y-3">
          {currentQuestion?.options.map((option, i) => {
            const isActive = selectedScore === option.score;
            const colorClass = OPTION_COLORS[i % OPTION_COLORS.length];
            return (
              <button
                key={option.score}
                onClick={() => handleSelect(option.score)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60",
                )}
              >
               

                <span className="flex-1 text-sm md:text-[15px] font-medium text-slate-700">
                  {option.label}
                </span>

                <span
                  className={cn(
                    "h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                    isActive
                      ? "border-primary bg-primary"
                      : "border-gray-300 bg-white",
                  )}
                >
                  {isActive && <Check className="h-3 w-3 text-white" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mx-auto w-full max-w-lg mt-10 flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={step === 1}
          className=" flex-1 gap-1 disabled:opacity-30 border-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          className=" flex-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground"
        >
          {step >= totalSteps ? "Submit" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
