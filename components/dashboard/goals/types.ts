import { goalsData } from "@/lib/client-data";

export type Goal = (typeof goalsData.goals)[number];
export type Scenario = (typeof goalsData.scenarios)[number];
export type ScenarioKey = Scenario["key"];
export type FilterType = "all" | "active" | "completed";

export type EnrichedGoal = Goal & {
  monthlyContributionNeeded: number;
  probability: number;
};
