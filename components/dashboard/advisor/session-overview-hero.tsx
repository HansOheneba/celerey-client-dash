"use client";

import * as React from "react";
import { CalendarDays, Clock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SessionAllocation } from "./types";

const PRIMARY = "rgb(27, 24, 86)";
const ACCENT = "rgb(140, 128, 248)";

function SessionDot({ filled }: { filled: boolean }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full border shrink-0 transition-colors"
      style={
        filled
          ? { backgroundColor: ACCENT, borderColor: ACCENT }
          : { backgroundColor: "transparent", borderColor: "rgb(203 213 225)" }
      }
    />
  );
}

type Props = {
  allocation: SessionAllocation;
  isTrial: boolean;
  onBook: () => void;
};

export function SessionOverviewHero({ allocation, isTrial, onBook }: Props) {
  const { totalIncluded, used, periodLabel, nextAvailableDate } = allocation;
  const remaining = Math.max(0, totalIncluded - used);
  const usedPct = totalIncluded > 0 ? (used / totalIncluded) * 100 : 0;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(27,24,86,0.12)" }}
      data-tour="primary-action"
    >
      {/* Top strip */}
      <div
        className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ backgroundColor: PRIMARY }}
      >
        <div>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider">
            Advisory sessions
          </p>
          <p className="text-white font-semibold mt-0.5">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {isTrial ? (
            <Button
              size="sm"
              className="gap-1.5 text-xs h-8 px-3"
              style={{ backgroundColor: PRIMARY, color: "white" }}
              onClick={onBook}
            >
              <Lock className="h-3 w-3" /> Unlock advisory sessions
            </Button>
          ) : remaining > 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8 px-3"
              style={{ backgroundColor: PRIMARY, color: "white" }}
              onClick={onBook}
            >
              <CalendarDays className="h-3 w-3" /> Book a session
            </Button>
          ) : (
            <Badge
              variant="outline"
              className="text-xs border-white/20 text-white/70 bg-white/5"
            >
              No sessions remaining
            </Badge>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div
        className="border-t border-white/10 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
        style={{ backgroundColor: "rgba(27,24,86,0.04)" }}
      >
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
            Included
          </p>
          <p
            className="text-2xl font-semibold mt-0.5"
            style={{ color: PRIMARY }}
          >
            {totalIncluded}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
            Used
          </p>
          <p className="text-2xl font-semibold mt-0.5 text-foreground">
            {used}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
            Remaining
          </p>
          <p
            className="text-2xl font-semibold mt-0.5"
            style={{
              color: remaining > 0 ? ACCENT : "var(--muted-foreground)",
            }}
          >
            {remaining}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
            Next available
          </p>
          <p className="text-sm font-semibold mt-1 text-foreground flex items-center gap-1.5">
            {isTrial ? (
              <span className="text-muted-foreground text-xs">
                Upgrade to access
              </span>
            ) : remaining > 0 ? (
              <>
                <Clock
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: ACCENT }}
                />
                {nextAvailableDate ?? "Available now"}
              </>
            ) : (
              <span className="text-muted-foreground text-xs">
                Period ended
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="px-5 pb-4 pt-2"
        style={{ backgroundColor: "rgba(27,24,86,0.03)" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted-foreground">Sessions used</p>
          <p className="text-xs font-medium" style={{ color: PRIMARY }}>
            {used} of {totalIncluded}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalIncluded }).map((_, i) => (
            <SessionDot key={i} filled={i < used} />
          ))}
          {totalIncluded === 0 && (
            <span className="text-xs text-muted-foreground">
              No sessions included in current plan
            </span>
          )}
        </div>
        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${usedPct}%`, backgroundColor: ACCENT }}
          />
        </div>
      </div>
    </div>
  );
}
