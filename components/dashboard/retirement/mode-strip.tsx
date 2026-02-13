"use client";

import { SlidersHorizontal, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type ModeStripProps = {
  simulationMode: boolean;
};

export function ModeStrip({ simulationMode }: ModeStripProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="gap-2">
        {simulationMode ? (
          <>
            <Wand2 className="h-3.5 w-3.5" />
            Simulation view
          </>
        ) : (
          <>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Actual view
          </>
        )}
      </Badge>

      {simulationMode ? (
        <span className="text-xs text-muted-foreground">
          Adjust sliders to explore “what-if” outcomes without changing your
          saved figures.
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">
          This reflects your saved profile and is what your advisor will use.
        </span>
      )}
    </div>
  );
}
