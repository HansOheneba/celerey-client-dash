"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { goalsData } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { GoalHeader } from "@/components/dashboard/goals/goal-header";
import { GoalFilterTabs } from "@/components/dashboard/goals/goal-filter-tabs";
import { GoalCard } from "@/components/dashboard/goals/goal-card";
import { ScenarioCard } from "@/components/dashboard/goals/scenario-card";
import { DeleteGoalDialog } from "@/components/dashboard/goals/delete-goal-dialog";
import { PriorityDialog } from "@/components/dashboard/goals/priority-dialog";
import { enrichGoalsWithCalculations } from "@/components/dashboard/goals/utils";
import type {
  Goal,
  Scenario,
  ScenarioId,
  EnrichedGoal,
  FilterType,
} from "@/components/dashboard/goals/types";

const SCENARIOS: Scenario[] = goalsData.scenarios;

export default function GoalsDashboard() {
  const router = useRouter();
  const storeGoals = useFinancialStore((s) => s.goals);

  const [goals, setGoals] = React.useState<Goal[]>(() =>
    [...storeGoals].sort((a, b) => a.priority - b.priority),
  );
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

  const [activeScenario, setActiveScenario] = React.useState<ScenarioId | null>(
    null,
  );

  const scenario = React.useMemo<Scenario | null>(() => {
    if (!activeScenario) return null;
    return SCENARIOS.find((s) => s.id === activeScenario) ?? null;
  }, [activeScenario]);

  // delete confirm dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<EnrichedGoal | null>(
    null,
  );

  // priority dialog state
  const [priorityOpen, setPriorityOpen] = React.useState(false);

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
    useFinancialStore.getState().removeGoal(pendingDelete.id);
    setDeleteOpen(false);
    setPendingDelete(null);
  };

  const cancelDelete = (): void => {
    setPendingDelete(null);
    setDeleteOpen(false);
  };

  const handlePrioritySave = (reordered: Goal[]) => {
    setGoals(reordered);
    const store = useFinancialStore.getState();
    reordered.forEach((g) => store.updateGoal(g));
  };

  return (
    <div className="min-h-screen from-background to-muted/20">
      <div className="mx-auto w-full px-4 py-8 md:px-6">
        {/* Header */}
        <GoalHeader
          onAddGoal={goToAddGoal}
          onEditPriority={() => setPriorityOpen(true)}
          hasPrioritizableGoals={goals.length > 1}
        />

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

      {/* Priority Dialog */}
      <PriorityDialog
        open={priorityOpen}
        onOpenChange={setPriorityOpen}
        goals={goals}
        onSave={handlePrioritySave}
      />

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
