import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EnrichedGoal, FilterType } from "./types";

export function GoalFilterTabs({
  filter,
  setFilter,
  goals,
}: {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  goals: EnrichedGoal[];
}) {
  const activeCount = goals.filter((g) => !g.completed).length;
  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <div className="mt-6 flex gap-2 border-b border-muted pb-2">
      <Button
        type="button"
        variant={filter === "all" ? "default" : "ghost"}
        size="sm"
        onClick={() => setFilter("all")}
        className={cn(
          "rounded-full",
          filter !== "all" && "text-muted-foreground",
        )}
      >
        All ({goals.length})
      </Button>
      <Button
        type="button"
        variant={filter === "active" ? "default" : "ghost"}
        size="sm"
        onClick={() => setFilter("active")}
        className={cn(
          "rounded-full",
          filter !== "active" && "text-muted-foreground",
        )}
      >
        Active ({activeCount})
      </Button>
      <Button
        type="button"
        variant={filter === "completed" ? "default" : "ghost"}
        size="sm"
        onClick={() => setFilter("completed")}
        className={cn(
          "rounded-full",
          filter !== "completed" && "text-muted-foreground",
        )}
      >
        Completed ({completedCount})
      </Button>
    </div>
  );
}
