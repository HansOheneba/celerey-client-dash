"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Answer = "A" | "B" | "C" | "D";
type RiskBand =
  | "Very Conservative"
  | "Moderately Conservative"
  | "Moderate Growth"
  | "Aggressive / High Risk";

interface QuizProps {
  onSave?: (result: {
    score: number;
    band: RiskBand;
    answers: Record<number, Answer>;
  }) => void;
  brandText?: string;
}

const QUESTIONS: Array<{
  id: number;
  question: string;
  options: Array<{ value: Answer; label: string }>;
}> = [
  {
    id: 1,
    question:
      "How would you react if your investment dropped 15% in one month?",
    options: [
      {
        value: "A",
        label: "I would sell immediately to prevent further losses",
      },
      { value: "B", label: "I would feel uncomfortable but wait and see" },
      { value: "C", label: "I would hold and stay calm" },
      { value: "D", label: "I would invest more while prices are lower" },
    ],
  },
  {
    id: 2,
    question: "Which statement best describes you?",
    options: [
      { value: "A", label: "I prefer stable returns, even if they are lower" },
      {
        value: "B",
        label: "I want some growth, but not at the cost of big losses",
      },
      {
        value: "C",
        label:
          "I am comfortable with ups and downs for higher long-term growth",
      },
      {
        value: "D",
        label:
          "I am willing to take significant risks for high potential returns",
      },
    ],
  },
  {
    id: 3,
    question:
      "If you were investing money you won't need for 5–10 years, what would you choose?",
    options: [
      { value: "A", label: "Guaranteed but low interest return" },
      {
        value: "B",
        label: "Mostly safe investments with a small portion in growth assets",
      },
      { value: "C", label: "Balanced mix of safe and growth investments" },
      { value: "D", label: "Mostly growth investments, even if volatile" },
    ],
  },
  {
    id: 4,
    question:
      "How important is avoiding losses compared to achieving high returns?",
    options: [
      { value: "A", label: "Avoiding losses is my top priority" },
      { value: "B", label: "I dislike losses but accept small risks" },
      { value: "C", label: "I understand losses are part of investing" },
      {
        value: "D",
        label: "I focus more on potential gains than temporary losses",
      },
    ],
  },
  {
    id: 5,
    question: "When making financial decisions, you usually:",
    options: [
      { value: "A", label: "Choose the safest option available" },
      { value: "B", label: "Research carefully and take moderate risks" },
      {
        value: "C",
        label: "Accept uncertainty if the potential reward is worth it",
      },
      {
        value: "D",
        label: "Prefer bold decisions that could lead to big outcomes",
      },
    ],
  },
  {
    id: 6,
    question:
      "If your friend doubled their money in a risky investment, you would:",
    options: [
      { value: "A", label: "Be glad for them but avoid it yourself" },
      { value: "B", label: "Consider it, but only with a small amount" },
      { value: "C", label: "Research and possibly invest" },
      { value: "D", label: "Jump in quickly to try and achieve similar gains" },
    ],
  },
];

const RISK_BANDS: Record<
  "conservative" | "moderate_conservative" | "moderate_growth" | "aggressive",
  { band: RiskBand; description: string }
> = {
  conservative: {
    band: "Very Conservative",
    description:
      "You prioritize capital preservation and stable, predictable returns.",
  },
  moderate_conservative: {
    band: "Moderately Conservative",
    description:
      "You prefer safety but accept small fluctuations for modest growth.",
  },
  moderate_growth: {
    band: "Moderate Growth",
    description:
      "You are comfortable with a balanced approach and understand volatility.",
  },
  aggressive: {
    band: "Aggressive / High Risk",
    description:
      "You accept significant fluctuations for higher long-term return potential.",
  },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function scoreForAnswer(a: Answer): number {
  const map: Record<Answer, number> = { A: 1, B: 2, C: 3, D: 4 };
  return map[a];
}

function getBand(score: number): { band: RiskBand; description: string } {
  if (score <= 10) return RISK_BANDS.conservative;
  if (score <= 15) return RISK_BANDS.moderate_conservative;
  if (score <= 19) return RISK_BANDS.moderate_growth;
  return RISK_BANDS.aggressive;
}

export default function RiskAttitudeQuiz({
  onSave,
}: QuizProps) {
  const totalSteps = QUESTIONS.length;

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const currentQuestion = QUESTIONS[step - 1];
  const selectedAnswer = answers[step];
  const canGoNext = selectedAnswer !== undefined;

  const score = useMemo(() => {
    return Object.values(answers).reduce(
      (sum, a) => sum + scoreForAnswer(a),
      0,
    );
  }, [answers]);

  const band = useMemo(() => getBand(score), [score]);

  function handleSelect(answer: Answer): void {
    setAnswers((prev) => ({ ...prev, [step]: answer }));
  }

  function handlePrevious(): void {
    if (step <= 1) return;
    setStep((s) => s - 1);
  }

  function handleNext(): void {
    if (!canGoNext) return;
    if (step >= totalSteps) {
      setShowResults(true);
      return;
    }
    setStep((s) => s + 1);
  }

  function handleRetake(): void {
    setStep(1);
    setAnswers({});
    setShowResults(false);
  }

  function handleSave(): void {
    onSave?.({ score, band: band.band, answers });
  }

  // Shared layout widths to match screenshot
  const pageMax = "max-w-[1400px]";
  const contentMax = "max-w-[820px]"; // question width
  const optionsMax = "max-w-[760px]"; // options column width

  if (showResults) {
    return (
      <div className="min-h-screen bg-white">
        {/* TOP STRIP */}
        <div className="pt-4">
          <div className={cn("mx-auto px-6", pageMax)}>
            <div className="flex gap-3">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="h-2 flex-1 rounded-full bg-gray-200">
                  <div className="h-2 w-full rounded-full bg-primary" />
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-widest">
                  PREVIOUS
                </span>
              </button>

           
            </div>
          </div>
        </div>


        <div className="pt-24 pb-24">
          <div className={cn("mx-auto px-6", pageMax)}>
            <div className="mx-auto text-center space-y-8 max-w-[860px]">
              <p className="text-xs font-semibold text-primary tracking-[0.25em]">
                YOUR RISK PROFILE
              </p>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
                {band.band}
              </h1>

              <div className="pt-2">
                <div className="relative w-28 h-28 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-orange-500/10" />
                  <div className="absolute inset-2 rounded-full bg-white border-2 border-orange-400 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {score}
                      </p>
                      <p className="text-xs text-gray-500">out of 24</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 text-base md:text-lg leading-relaxed mx-auto max-w-[680px]">
                {band.description}
              </p>

              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="rounded-full  h-auto font-semibold"
                >
                  Retake Quiz
                </Button>

                <Button
                  onClick={handleSave}
                  className="rounded-full h-auto font-semibold "
                >
                  Save Result
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  return (
    <div className=" bg-white">
      {/* TOP STRIP */}
      <div className="pt-4">
        <div className={cn("mx-auto px-6", pageMax)}>
          {/* Progress segments pinned to top */}
          <div className="flex gap-3">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const active = i <= step - 1;
              return (
                <div key={i} className="h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-opacity duration-200",
                      active
                        ? "w-full bg-blue-900 opacity-100"
                        : "w-full opacity-0",
                    )}
                  />
                </div>
              );
            })}
          </div>

          {/* Header row spacing like screenshot */}
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm text-blue-700 font-thin tracking-widest">
                PREVIOUS
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* MAIN BODY: large whitespace above question */}
      <div className="pt-28">
        <div className={cn("mx-auto px-6", pageMax)}>
          <div className={cn("mx-auto", contentMax)}>
            {/* QUESTION COUNTER sits above question */}
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-900 tracking-[0.25em]">
                QUESTION {step} / {totalSteps}
              </p>
            </div>

            {/* Big headline with lots of top spacing */}
            <h2 className="mt-6 text-center text-xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {currentQuestion?.question}
            </h2>

            {/* Options block spacing like screenshot */}
            <div className={cn("mt-10 mx-auto space-y-4", optionsMax)}>
              {currentQuestion?.options.map((option) => {
                const isActive = selectedAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full rounded-full px-6 py-4 text-left transition",
                      "bg-gray-100 hover:bg-gray-200",
                      "flex items-center gap-4",
                      isActive && "bg-blue-50 ring-2 ring-blue-900",
                    )}
                  >
                    {/* Radio */}
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                        isActive
                          ? "border-blue-900 bg-blue-900"
                          : "border-gray-400 bg-white",
                      )}
                    >
                      {isActive ? (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      ) : null}
                    </span>

                    <span className="text-[15px] md:text-base text-slate-700">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Button sits lower with large spacing */}
            <div className="mt-24 flex justify-center pb-24">
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                className="rounded-full h-auto text-base font-semibold bg-blue-900 hover:bg-blue-800 disabled:opacity-50"
              >
                Next Question
                <ChevronRight className=" h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
