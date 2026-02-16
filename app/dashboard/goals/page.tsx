"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { goalsData } from "@/lib/client-data";
import { GoalHeader } from "@/components/dashboard/goals/goal-header";
import { GoalFilterTabs } from "@/components/dashboard/goals/goal-filter-tabs";
import { GoalCard } from "@/components/dashboard/goals/goal-card";
import { ScenarioCard } from "@/components/dashboard/goals/scenario-card";
import { DeleteGoalDialog } from "@/components/dashboard/goals/delete-goal-dialog";
import { enrichGoalsWithCalculations } from "@/components/dashboard/goals/utils";
import type {
  Goal,
  Scenario,
  ScenarioKey,
  EnrichedGoal,
  FilterType,
} from "@/components/dashboard/goals/types";

const DEFAULT_GOALS: Goal[] = goalsData.goals;
const SCENARIOS: Scenario[] = goalsData.scenarios;

export default function GoalsDashboard() {
  const router = useRouter();

  const [goals, setGoals] = React.useState<Goal[]>(DEFAULT_GOALS);
  const [filter, setFilter] = React.useState<FilterType>("active");

  // Enrich goals with calculated values based on cash flow
  const enrichedGoals = React.useMemo<EnrichedGoal[]>(() => {
    return enrichGoalsWithCalculations(goals);
  }, [goals]);

  // Filter goals based on selected filter
  const filteredGoals = React.useMemo(() => {
    if (filter === "all") return enrichedGoals;
    if (filter === "active") return enrichedGoals.filter((g) => !g.completed);
    return enrichedGoals.filter((g) => g.completed);
  }, [enrichedGoals, filter]);

  const [activeScenario, setActiveScenario] =
    React.useState<ScenarioKey | null>(null);

  const scenario = React.useMemo<Scenario | null>(() => {
    if (!activeScenario) return null;
    return SCENARIOS.find((s) => s.key === activeScenario) ?? null;
  }, [activeScenario]);

  // delete confirm dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<EnrichedGoal | null>(
    null,
  );

  const goToAddGoal = (): void => {
    router.push("/dashboard/goals/new");
  };

  const goToEditGoal = (goalId: string): void => {
    router.push(`/dashboard/goals/${goalId}/edit`);
  };

  const requestDelete = (goal: EnrichedGoal): void => {
    setPendingDelete(goal);
    setDeleteOpen(true);
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;
    setGoals((prev) => prev.filter((g) => g.id !== pendingDelete.id));
    setDeleteOpen(false);
    setPendingDelete(null);
  };

  const cancelDelete = (): void => {
    setPendingDelete(null);
    setDeleteOpen(false);
  };

  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <GoalHeader onAddGoal={goToAddGoal} />

        {/* Filter Tabs */}
        <GoalFilterTabs
          filter={filter}
          setFilter={setFilter}
          goals={enrichedGoals}
        />

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              scenario={scenario}
              onEdit={goToEditGoal}
              onRequestDelete={requestDelete}
            />
          ))}
        </div>

        {/* Scenario modeling */}
        <ScenarioCard
          scenarios={SCENARIOS}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteGoalDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pendingDelete={pendingDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
