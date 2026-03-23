import type { Goal, Scenario } from "@/lib/client-data";

export type { Goal };
export type { Scenario };
export type ScenarioKey = Scenario["key"];
export type FilterType = "all" | "active" | "completed";

export type EnrichedGoal = Goal & {
  monthlyContributionNeeded: number;
  probability: number;
};
