import { formatCurrency } from "@/lib/client-data";
import { Goal, EnrichedGoal } from "./types";

export { formatCurrency };

// ============================================================================
// FORMATTING & UTILITY FUNCTIONS
// ============================================================================

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function progressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return clamp((current / target) * 100, 0, 100);
}

export function probabilityTone(
  p: number,
): "default" | "secondary" | "destructive" {
  if (p >= 85) return "default";
  if (p >= 70) return "secondary";
  return "destructive";
}

export function formatTimeRemaining(targetDate?: string): string {
  if (!targetDate) return "";
  const ms = new Date(targetDate).getTime() - Date.now();
  if (ms <= 0) return "Past target date";
  const totalMonths = Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));
  if (totalMonths < 1) return "Less than a month";
  if (totalMonths < 12)
    return `${totalMonths} month${totalMonths !== 1 ? "s" : ""} remaining`;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""} remaining`;
  return `${years} yr ${months} mo remaining`;
}

export type GoalHealth = "on-track" | "at-risk" | "off-track";

export function goalHealth(probability: number): GoalHealth {
  if (probability >= 75) return "on-track";
  if (probability >= 50) return "at-risk";
  return "off-track";
}

// ============================================================================
// GOAL ENRICHMENT
// ============================================================================

/**
 * Passes through goals as EnrichedGoal - monthlyContributionNeeded and
 * probability are backend-computed fields already present on each Goal.
 * No local derivation needed.
 */
export function enrichGoalsWithCalculations(goals: Goal[]): EnrichedGoal[] {
  return goals as EnrichedGoal[];
}
