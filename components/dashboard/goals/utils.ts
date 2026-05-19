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
