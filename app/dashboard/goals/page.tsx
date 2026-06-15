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
} from "@/lib/dashboard-api";
import { GoalHeader } from "@/components/dashboard/goals/goal-header";
import { GoalFilterTabs } from "@/components/dashboard/goals/goal-filter-tabs";
import { GoalCard } from "@/components/dashboard/goals/goal-card";
import { KpiStrip, type KpiItem } from "@/components/dashboard/kpi-strip";
import { formatCurrency } from "@/components/dashboard/goals/utils";
import { GoalPlanSummary } from "@/components/dashboard/goals/scenario-card";
import { DeleteGoalDialog } from "@/components/dashboard/goals/delete-goal-dialog";
import { PriorityDialog } from "@/components/dashboard/goals/priority-dialog";
import { enrichGoalsWithCalculations } from "@/components/dashboard/goals/utils";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { useTourDemoData } from "@/hooks/useTourDemo";
import { TOUR_DEMO_GOALS } from "@/lib/tour-demo-data";
import type {
  Goal,
  EnrichedGoal,
  FilterType,
} from "@/components/dashboard/goals/types";

export default function GoalsDashboard() {
  const router = useRouter();
  const { loading } = usePageData("goals");
  const storeGoals = useFinancialStore((s) => s.goals);
  const goalsMeta = useFinancialStore((s) => s.goalsMeta);

  const [goals, setGoals] = React.useState<Goal[]>(() =>
    [...storeGoals].sort((a, b) => a.priority - b.priority),
  );

  // Sync whenever the store is updated by the fetch
  React.useEffect(() => {
    setGoals([...storeGoals].sort((a, b) => a.priority - b.priority));
  }, [storeGoals]);

  const { data: displayGoals } = useTourDemoData(
    goals,
    TOUR_DEMO_GOALS,
  );

  const [filter, setFilter] = React.useState<FilterType>("active");

  // Enrich goals with calculated values based on cash flow
  const enrichedGoals = React.useMemo<EnrichedGoal[]>(() => {
    return enrichGoalsWithCalculations(displayGoals);
  }, [displayGoals]);

  // Filter goals based on selected filter
  const filteredGoals = React.useMemo(() => {
    if (filter === "all") return enrichedGoals;
    if (filter === "active") return enrichedGoals.filter((g) => !g.completed);
    return enrichedGoals.filter((g) => g.completed);
  }, [enrichedGoals, filter]);

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

        {/* KPI Strip */}
        <div className="mt-4">
          <KpiStrip
            cols={4}
            loading={loading}
            items={
              [
                {
                  label: "Monthly contribution needed",
                  value: formatCurrency(goalsMeta.totalMonthlyNeeded),
                  subline: "across all active goals",
                },
                {
                  label: "Total goals",
                  value: String(goalsMeta.totalGoals),
                },
                {
                  label: "Active",
                  value: String(goalsMeta.activeGoals),
                  tone: "neutral",
                },
                {
                  label: "Completed",
                  value: String(goalsMeta.completedGoals),
                  tone: "good",
                },
              ] satisfies KpiItem[]
            }
          />
        </div>

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
                  onEdit={goToEditGoal}
                  onRequestDelete={requestDelete}
                />
              ))}
        </div>

        {/* Goal Health Summary */}
        <GoalPlanSummary goals={enrichedGoals} />
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
