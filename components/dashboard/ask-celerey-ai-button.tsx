"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/components/dashboard/ProfilePanelContext";
import { fromDemoPath, isDemoPath, toDemoPath } from "@/lib/demo-mode";

const PROMPT_MAP: Record<string, string> = {
  "/dashboard":
    "Give me a complete overview of my financial health and highlight my top priorities right now.",
  "/dashboard/goals":
    "How am I tracking on my financial goals and what can I do to reach them faster?",
  "/dashboard/assets":
    "Analyse my investment portfolio and suggest how to optimise my asset allocation.",
  "/dashboard/properties":
    "Review my property portfolio and flag any risks or opportunities I should act on.",
  "/dashboard/insurance":
    "Am I adequately insured? Review my coverage and highlight any gaps or over-coverage.",
  "/dashboard/cash-flow":
    "Analyse my income and expenses in detail. How can I improve my monthly surplus?",
  "/dashboard/liabilities":
    "Help me build a debt payoff strategy based on my current liabilities.",
  "/dashboard/retirement":
    "How is my retirement plan tracking? What should I change to reach my goals faster?",
  "/dashboard/financial":
    "Give me a full analysis of my financial position and suggest the most impactful next steps.",
  "/dashboard/concierge":
    "What premium financial services or advisor support would benefit me most given my current profile?",
  "/dashboard/advisor":
    "What questions should I bring to my next advisor meeting based on my current financial picture?",
  "/dashboard/account":
    "Review my account setup and tell me if there is anything I should update or complete.",
  "/dashboard/profile":
    "Based on my profile, what financial opportunities or risks should I be most aware of?",
  "/dashboard/support":
    "What common financial issues do users like me face and how can I address them proactively?",
};

export function AskCelereyAIButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen } = useProfilePanel();

  const inDemo = isDemoPath(pathname);

  // Hide on the AI page itself, and when the profile panel is open
  if (
    pathname === "/dashboard/ai" ||
    pathname === "/dashboard/demo/ai" ||
    isOpen
  )
    return null;

  const promptKey = fromDemoPath(pathname);
  const prompt =
    PROMPT_MAP[promptKey] ??
    "Give me a personalised summary of my financial health.";

  function handleClick() {
    const aiHref = inDemo
      ? toDemoPath("/dashboard/ai")
      : "/dashboard/ai";
    router.push(`${aiHref}?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group fixed bottom-6 right-6 z-50 flex items-center gap-2",
        "rounded-full bg-[#18163f] px-4 py-3 shadow-lg",
        "text-white text-sm font-medium",
        "transition-all duration-200 hover:bg-[#1e1c4e] hover:shadow-xl hover:scale-105",
        "border border-white/10",
      )}
      aria-label="Ask Celerey AI"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
        <img
          src="https://i.ibb.co/mCs0QnX1/Celerey-Secondary-Symbol-Light-1.png"
          alt="Celerey"
          className="h-4 w-4 object-contain"
        />
      </div>
      <span className="whitespace-nowrap">Ask Celerey AI</span>
    </button>
  );
}
