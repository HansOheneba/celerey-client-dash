"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock,
  User,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import type { UpcomingSession } from "./types";

const PRIMARY = "rgb(27, 24, 86)";
const ACCENT = "rgb(140, 128, 248)";

const SESSION_TYPE_LABELS: Record<UpcomingSession["type"], string> = {
  annual_review: "Annual Review",
  quarterly_checkin: "Quarterly Check-in",
  goal_planning: "Goal Planning",
  portfolio_review: "Portfolio Review",
  tax_planning: "Tax Planning",
  ad_hoc: "Advisory Session",
};

type Props = {
  session: UpcomingSession;
};

export function UpcomingSessionCard({ session }: Props) {
  return (
    <DashCard>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-base" style={{ color: PRIMARY }}>
              Upcoming session
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your next confirmed advisory session.
            </p>
          </div>
          <Badge
            className="rounded-full text-xs shrink-0 text-white"
            style={{ backgroundColor: ACCENT }}
          >
            Confirmed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session details */}
        <div className="rounded-xl border p-4 bg-background/60 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-base font-semibold text-foreground">
              {SESSION_TYPE_LABELS[session.type]}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <CalendarDays
                className="h-4 w-4 mt-0.5 shrink-0"
                style={{ color: ACCENT }}
              />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Date
                </p>
                <p className="text-sm font-medium text-foreground">
                  {session.date}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock
                className="h-4 w-4 mt-0.5 shrink-0"
                style={{ color: ACCENT }}
              />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Time
                </p>
                <p className="text-sm font-medium text-foreground">
                  {session.timeLabel}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User
                className="h-4 w-4 mt-0.5 shrink-0"
                style={{ color: ACCENT }}
              />
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Advisor
                </p>
                <p className="text-sm font-medium text-foreground">
                  {session.advisorName}
                </p>
              </div>
            </div>
          </div>

          {session.focusAreas.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Planned focus areas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {session.focusAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="outline"
                    className="text-xs rounded-full"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Joining info */}
        <div className="rounded-xl bg-muted/20 border border-dashed border-muted/60 p-3">
          <p className="text-xs text-muted-foreground text-center">
            Joining details are shared 24 hours before the session.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {session.joinUrl && (
            <Button
              size="sm"
              className="gap-1.5 text-xs h-8"
              style={{ backgroundColor: PRIMARY, color: "white" }}
              asChild
            >
              <a href={session.joinUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> Join session
              </a>
            </Button>
          )}
          {session.rescheduleUrl && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8"
              asChild
            >
              <a href={session.rescheduleUrl} target="_blank" rel="noreferrer">
                <RefreshCw className="h-3.5 w-3.5" /> Reschedule
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </DashCard>
  );
}
