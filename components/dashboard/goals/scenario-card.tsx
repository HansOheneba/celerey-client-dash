import { DashCard, CardContent, CardHeader, CardTitle } from "@/components/dashboard/dash-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Scenario, ScenarioKey } from "./types";

export function ScenarioCard({
  scenarios,
  activeScenario,
  setActiveScenario,
}: {
  scenarios: Scenario[];
  activeScenario: ScenarioKey | null;
  setActiveScenario: (key: ScenarioKey | null) => void;
}) {
  return (
    <DashCard className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">AI Scenario Modeling</CardTitle>
        <p className="text-sm text-muted-foreground">
          See how life changes could affect your goals.
        </p>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2">
        {scenarios.map((s) => {
          const isActive = s.key === activeScenario;
          return (
            <Button
              key={s.key}
              type="button"
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "rounded-full",
                isActive ? "" : "bg-muted/60 text-foreground hover:bg-muted",
              )}
              onClick={() => setActiveScenario(isActive ? null : s.key)}
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
