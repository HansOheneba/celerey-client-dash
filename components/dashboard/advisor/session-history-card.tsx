"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import type { AdvisorySession } from "./types";

const PRIMARY = "rgb(27, 24, 86)";
const ACCENT = "rgb(140, 128, 248)";

const SESSION_TYPE_LABELS: Record<AdvisorySession["type"], string> = {
  annual_review: "Annual Review",
  quarterly_checkin: "Quarterly Check-in",
  goal_planning: "Goal Planning",
  portfolio_review: "Portfolio Review",
  tax_planning: "Tax Planning",
  ad_hoc: "Advisory Session",
};

type SessionRowProps = {
  session: AdvisorySession;
  isLast: boolean;
};

function SessionRow({ session, isLast }: SessionRowProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-4 top-10 bottom-0 w-px"
          style={{ backgroundColor: "rgba(140,128,248,0.2)" }}
        />
      )}

      <div className="flex gap-3">
        {/* Timeline dot */}
        <div
          className="mt-1 h-9 w-9 shrink-0 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold z-10"
          style={{ backgroundColor: PRIMARY, borderColor: ACCENT }}
        >
          <CalendarDays className="h-4 w-4" />
        </div>

        <div className="flex-1 pb-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {SESSION_TYPE_LABELS[session.type]}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{session.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.durationMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {session.advisorName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {session.focusAreas.slice(0, 2).map((area) => (
                  <Badge
                    key={area}
                    variant="outline"
                    className="text-[10px] rounded-full hidden sm:inline-flex"
                  >
                    {area}
                  </Badge>
                ))}
                {open ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {open && (
            <div className="mt-3 rounded-xl border p-4 bg-background/60 space-y-3">
              {/* Advisor assessment */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Advisor notes
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {session.advisorAssessment}
                </p>
              </div>

              {/* Key points */}
              {session.keyDiscussionPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Discussion points
                  </p>
                  <ul className="space-y-1">
                    {session.keyDiscussionPoints.map((pt, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/70"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ACCENT }}
                        />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {session.actionItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Action items (
                    {session.actionItems.filter((a) => a.done).length}/
                    {session.actionItems.length} completed)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {session.actionItems.map((item) => (
                      <span
                        key={item.id}
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border",
                          item.done
                            ? "line-through text-muted-foreground border-muted/40 bg-transparent"
                            : "border-muted/60 bg-muted/20 text-foreground/70",
                        )}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type Props = {
  sessions: AdvisorySession[];
};

export function SessionHistoryCard({ sessions }: Props) {
  return (
    <DashCard>
      <CardHeader>
        <CardTitle className="text-base" style={{ color: PRIMARY }}>
          Advisory history
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A record of all your past advisory sessions. Expand each entry for
          notes and discussion points.
        </p>
      </CardHeader>

      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No past sessions on record.
          </p>
        ) : (
          <div>
            {sessions.map((s, i) => (
              <SessionRow
                key={s.id}
                session={s}
                isLast={i === sessions.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </DashCard>
  );
}
