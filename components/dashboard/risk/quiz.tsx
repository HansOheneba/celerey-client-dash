"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type OptionScore = 1 | 2 | 3 | 4 | 5;
type RiskBand =
  | "Capital Preservation"
  | "Conservative"
  | "Balanced"
  | "Growth"
  | "Aggressive";

interface QuizProps {
  onSave?: (result: {
    score: number;
    band: RiskBand;
    answers: Record<number, OptionScore>;
  }) => void;
  brandText?: string;
}

const QUESTIONS: Array<{
  id: number;
  question: string;
  options: Array<{ score: OptionScore; label: string }>;
}> = [
  {
    id: 1,
    question: "What is your primary investment objective?",
    options: [
      { score: 1, label: "Preserving my capital and avoiding losses" },
      { score: 2, label: "Generating stable income" },
      { score: 3, label: "Balanced growth and income" },
      { score: 4, label: "Long term capital growth" },
      { score: 5, label: "Maximizing long term growth" },
    ],
  },
  {
    id: 2,
    question:
      "If your investment portfolio declined by 20% in a year, what would you most likely do?",
    options: [
      { score: 1, label: "Sell all investments immediately" },
      { score: 2, label: "Sell part of the portfolio to reduce risk" },
      { score: 3, label: "Hold the investments and wait for recovery" },
      { score: 5, label: "Invest additional money at lower prices" },
    ],
  },
  {
    id: 3,
    question:
      "How long do you plan to keep the majority of your investments before needing the funds?",
    options: [
      { score: 1, label: "Less than 1 year" },
      { score: 2, label: "1 to 3 years" },
      { score: 3, label: "3 to 5 years" },
      { score: 4, label: "5 to 10 years" },
      { score: 5, label: "More than 10 years" },
    ],
  },
  {
    id: 4,
    question: "How experienced are you with investing?",
    options: [
      { score: 1, label: "No investment experience" },
      { score: 2, label: "Limited experience" },
      { score: 3, label: "Moderate experience" },
      { score: 4, label: "Experienced investor" },
      { score: 5, label: "Very experienced or professional investor" },
    ],
  },
  {
    id: 5,
    question: "How comfortable are you with investment volatility?",
    options: [
      { score: 1, label: "I prefer very stable investments" },
      { score: 2, label: "I can tolerate small fluctuations" },
      { score: 3, label: "I accept moderate fluctuations" },
      { score: 4, label: "I am comfortable with significant fluctuations" },
      { score: 5, label: "I accept high volatility for higher returns" },
    ],
  },
  {
    id: 6,
    question:
      "How much of your total savings are you planning to invest this year?",
    options: [
      { score: 1, label: "More than 90%" },
      { score: 2, label: "70 to 90%" },
      { score: 3, label: "50 to 70%" },
      { score: 4, label: "30 to 50%" },
      { score: 5, label: "Less than 30%" },
    ],
  },
  {
    id: 7,
    question:
      "If markets fell by 30% during a financial crisis, what would you most likely do?",
    options: [
      { score: 1, label: "Sell everything to avoid further losses" },
      { score: 2, label: "Reduce my investments" },
      { score: 3, label: "Wait for markets to recover" },
      { score: 5, label: "Invest more during the downturn" },
    ],
  },
  {
    id: 8,
    question: "How stable is your primary source of income?",
    options: [
      { score: 1, label: "Highly unpredictable income" },
      { score: 2, label: "Freelance or commission based income" },
      { score: 3, label: "Business income" },
      { score: 4, label: "Stable corporate salary" },
      { score: 5, label: "Government or long term secure employment" },
    ],
  },
  {
    id: 9,
    question:
      "Do you currently hold investments across multiple asset classes?",
    options: [
      { score: 1, label: "No investments" },
      { score: 2, label: "Mostly one type of investment" },
      { score: 3, label: "Some diversification" },
      { score: 4, label: "Well diversified portfolio" },
      { score: 5, label: "Highly diversified portfolio" },
    ],
  },
  {
    id: 10,
    question:
      "When will you likely need access to a significant portion of this investment?",
    options: [
      { score: 1, label: "Within the next year" },
      { score: 2, label: "Within 1 to 3 years" },
      { score: 3, label: "Within 3 to 5 years" },
      { score: 4, label: "Within 5 to 10 years" },
      { score: 5, label: "More than 10 years" },
    ],
  },
];

const RISK_BANDS: Record<
  | "capital_preservation"
  | "conservative"
  | "balanced"
  | "growth"
  | "aggressive",
  { band: RiskBand; description: string; strategy: string }
> = {
  capital_preservation: {
    band: "Capital Preservation",
    description:
      "You prioritize protecting your capital above all else, preferring stable and predictable returns over growth.",
    strategy: "Focus on stability with capital preservation instruments.",
  },
  conservative: {
    band: "Conservative",
    description:
      "You prefer lower-risk investments and can tolerate only small fluctuations in pursuit of modest returns.",
    strategy: "Low volatility portfolio with income-generating assets.",
  },
  balanced: {
    band: "Balanced",
    description:
      "You are comfortable with a balanced approach, accepting moderate volatility in exchange for a mix of growth and income.",
    strategy: "Balanced mix of growth and income investments.",
  },
  growth: {
    band: "Growth",
    description:
      "You are focused on long-term capital growth and comfortable with significant market fluctuations along the way.",
    strategy: "Growth oriented diversified portfolio.",
  },
  aggressive: {
    band: "Aggressive",
    description:
      "You accept high volatility and significant short-term losses in pursuit of maximum long-term capital growth.",
    strategy: "High growth strategy with exposure to higher-risk assets.",
  },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Final Risk Score = sum of all question scores ÷ 10
 * Produces a value between 1.0 and 5.0.
 */
function calculateRiskScore(answers: Record<number, OptionScore>): number {
  const total = Object.values(answers).reduce((sum, s) => sum + s, 0);
  return Math.round((total / 10) * 10) / 10;
}

function getBand(riskScore: number): {
  band: RiskBand;
  description: string;
  strategy: string;
} {
  if (riskScore <= 1.8) return RISK_BANDS.capital_preservation;
  if (riskScore <= 2.6) return RISK_BANDS.conservative;
  if (riskScore <= 3.4) return RISK_BANDS.balanced;
  if (riskScore <= 4.2) return RISK_BANDS.growth;
  return RISK_BANDS.aggressive;
}

export default function RiskAttitudeQuiz({ onSave }: QuizProps) {
  const totalSteps = QUESTIONS.length;

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, OptionScore>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const currentQuestion = QUESTIONS[step - 1];
  const selectedScore = answers[step];
  const canGoNext = selectedScore !== undefined;

  const riskScore = useMemo(() => calculateRiskScore(answers), [answers]);

  const band = useMemo(() => getBand(riskScore), [riskScore]);

  function handleSelect(score: OptionScore): void {
    setAnswers((prev) => ({ ...prev, [step]: score }));
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
    onSave?.({ score: riskScore, band: band.band, answers });
  }

  const pageMax = "max-w-[90rem]"; // 1440px
  const contentMax = "max-w-[980px]"; // question area
  const optionsMax = "max-w-[920px]"; // options buttons

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
            <div className="mx-auto max-w-[980px] text-center space-y-8">
              <p className="text-xs font-semibold text-primary tracking-[0.25em]">
                YOUR RISK PROFILE
              </p>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
                {band.band}
              </h1>

              {/* Risk score badge */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-6 py-3">
                  <span className="text-2xl font-bold text-blue-900">
                    {riskScore.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">/ 5</span>
                </div>
              </div>

              <p className="text-slate-600 text-base md:text-lg leading-relaxed mx-auto max-w-[760px]">
                {band.description}
              </p>

              {/* Suggested strategy */}
              <div className="mx-auto max-w-[560px] rounded-2xl bg-slate-50 border border-slate-200 px-6 py-4 text-left">
                <p className="text-xs font-semibold text-slate-400 tracking-widest mb-1">
                  SUGGESTED STRATEGY
                </p>
                <p className="text-sm text-slate-700 font-medium">
                  {band.strategy}
                </p>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="rounded-full h-auto font-semibold"
                >
                  Retake Quiz
                </Button>

                <Button
                  onClick={handleSave}
                  className="rounded-full h-auto font-semibold"
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
    <div className="bg-white">
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

      {/* MAIN BODY */}
      <div className="pt-24 md:pt-28 ">
        <div className={cn("mx-auto px-6", pageMax)}>
          <div className={cn("mx-auto", contentMax)}>
            {/* QUESTION COUNTER */}
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-900 tracking-[0.25em]">
                QUESTION {step} / {totalSteps}
              </p>
            </div>

            {/* Headline */}
            <h2 className="mt-6 text-center text-xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {currentQuestion?.question}
            </h2>

            {/* Options */}
            <div className={cn("mt-10 mx-auto space-y-4", optionsMax)}>
              {currentQuestion?.options.map((option) => {
                const isActive = selectedScore === option.score;
                return (
                  <button
                    key={option.score}
                    onClick={() => handleSelect(option.score)}
                    className={cn(
                      "w-full rounded-full px-7 py-4 text-left transition",
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

            {/* CTA */}
            <div className="mt-20 md:mt-24 flex justify-center pb-24">
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                className="rounded-full h-auto text-base font-semibold bg-blue-900 hover:bg-blue-800 disabled:opacity-50"
              >
                Next Question
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
