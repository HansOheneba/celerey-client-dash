import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Scenario, ScenarioId } from "./types";

export function ScenarioCard({
  scenarios,
  activeScenario,
  setActiveScenario,
}: {
  scenarios: Scenario[];
  activeScenario: ScenarioId | null;
  setActiveScenario: (key: ScenarioId | null) => void;
}) {
  return (
    <DashCard className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">Celerey Scenario Modeling</CardTitle>
        <p className="text-sm text-muted-foreground">
          See how life changes could affect your goals.
        </p>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2">
        {scenarios.map((s) => {
          const isActive = s.id === activeScenario;
          return (
            <Button
              key={s.id}
              type="button"
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "rounded-full",
                isActive ? "" : "bg-muted/60 text-foreground hover:bg-muted",
              )}
              onClick={() => setActiveScenario(isActive ? null : s.id)}
            >
              {s.label}
            </Button>
          );
        })}

        {activeScenario ? (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => setActiveScenario(null)}
          >
            Clear
          </Button>
        ) : null}
      </CardContent>
    </DashCard>
  );
}
