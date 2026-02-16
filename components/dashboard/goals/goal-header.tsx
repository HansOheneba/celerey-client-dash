import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoalHeader({ onAddGoal }: { onAddGoal: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Goals & Life Planning
        </h1>
        <p className="text-sm text-muted-foreground">
          Track progress toward milestones.
        </p>
      </div>

      <Button onClick={onAddGoal} className="gap-2">
        <Plus className="h-4 w-4" />
        Add goal
      </Button>
    </div>
  );
}
