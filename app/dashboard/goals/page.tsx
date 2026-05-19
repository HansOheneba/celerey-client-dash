"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { useFinancialStore } from "@/store/financialStore";
import { usePageData } from "@/hooks/usePageData";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  deleteGoal as apiDeleteGoal,
  reorderGoalPriorities,
  fetchGoalScenarios,
} from "@/lib/dashboard-api";
import { GoalHeader } from "@/components/dashboard/goals/goal-header";
import { GoalFilterTabs } from "@/components/dashboard/goals/goal-filter-tabs";
import { GoalCard } from "@/components/dashboard/goals/goal-card";
import { ScenarioCard } from "@/components/dashboard/goals/scenario-card";
import { DeleteGoalDialog } from "@/components/dashboard/goals/delete-goal-dialog";
import { PriorityDialog } from "@/components/dashboard/goals/priority-dialog";
import { enrichGoalsWithCalculations } from "@/components/dashboard/goals/utils";
import { dashboardTheme } from "@/lib/dashboard-theme";
import type {
  Goal,
  Scenario,
  ScenarioId,
  EnrichedGoal,
  FilterType,
} from "@/components/dashboard/goals/types";

const FALLBACK_SCENARIOS: Scenario[] = [];

export default function GoalsDashboard() {
  const router = useRouter();
  const { loading } = usePageData("goals");
  const storeGoals = useFinancialStore((s) => s.goals);

  const [scenarios, setScenarios] =
    React.useState<Scenario[]>(FALLBACK_SCENARIOS);

  // Fetch scenarios from API on mount, fall back to static data
  React.useEffect(() => {
    fetchGoalScenarios()
      .then((list) => {
        console.log("[GoalsDashboard] fetched scenarios:", list);
        if (list.length > 0) {
          setScenarios(
            list.map((s) => ({
              id: s.id as ScenarioId,
              label: s.label ?? s.name ?? s.id,
              description: s.description ?? "",
              monthlyReturnRate: s.monthly_return_rate ?? 0.005,
              inflationRate: s.inflation_rate ?? 0.02,
              monthlyMultiplier: s.monthly_multiplier,
            })),
          );
        }
      })
      .catch((err) =>
        console.warn(
          "[GoalsDashboard] fetchGoalScenarios failed, using fallback:",
          err,
        ),
      );
  }, []);

  const [goals, setGoals] = React.useState<Goal[]>(() =>
    [...storeGoals].sort((a, b) => a.priority - b.priority),
  );

  // Sync whenever the store is updated by the fetch
  React.useEffect(() => {
    setGoals([...storeGoals].sort((a, b) => a.priority - b.priority));
  }, [storeGoals]);
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
    return scenarios.find((s) => s.id === activeScenario) ?? null;
  }, [activeScenario, scenarios]);

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
    const name = pendingDelete.title;
    setGoals((prev) => prev.filter((g) => g.id !== pendingDelete.id));
    useFinancialStore.getState().removeGoal(pendingDelete.id);
    apiDeleteGoal(pendingDelete.id).catch(() => {
      toast.error(`Failed to delete "${name}". Please try again.`);
    });
    toast.success(`"${name}" deleted.`);
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
    reorderGoalPriorities(
      reordered.map((g) => ({ goal_id: g.id, priority: g.priority })),
    )
      .then(() => toast.success("Priorities saved."))
      .catch(() => toast.error("Failed to save priorities. Please try again."));
  };

  return (
    // Outer wrapper is just the motion fade; the dashboard layout already
    // provides the page background (dashboardTheme.surface). The inner div
    // uses the shared pageContainer token so spacing matches every other tab.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={dashboardTheme.pageContainer}>
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
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-xl" />
              ))
            : filteredGoals.map((g) => (
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
          scenarios={scenarios}
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
    </motion.div>
  );
}
