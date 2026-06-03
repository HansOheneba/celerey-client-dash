import { useRouter } from "next/navigation";
import { TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import { cn } from "@/lib/utils";
import { EnrichedGoal } from "./types";
import { formatCurrency, goalHealth } from "./utils";

const brand = {
  primary: "rgb(27 24 86)",
  accent: "rgb(140 128 248)",
  soft: "rgba(140, 128, 248, 0.12)",
  softBorder: "rgba(140, 128, 248, 0.25)",
};

export function GoalPlanSummary({ goals }: { goals: EnrichedGoal[] }) {
  const router = useRouter();

  const active = goals.filter((g) => !g.completed);

  const onTrack = active.filter(
    (g) => goalHealth(g.probability) === "on-track",
  );
  const atRisk = active.filter((g) => goalHealth(g.probability) === "at-risk");
  const offTrack = active.filter(
    (g) => goalHealth(g.probability) === "off-track",
  );

  const totalMonthlyNeeded = active.reduce(
    (s, g) => s + (g.monthlyContributionNeeded ?? 0),
    0,
  );

  const needsAttention =
    offTrack.sort(
      (a, b) => b.monthlyContributionNeeded - a.monthlyContributionNeeded,
    )[0] ??
    atRisk.sort(
      (a, b) => b.monthlyContributionNeeded - a.monthlyContributionNeeded,
    )[0] ??
    null;

  if (active.length === 0) return null;

  return (
    <DashCard className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base" style={{ color: brand.primary }}>
          Goal Health Summary
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          How your active goals are tracking right now.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <StatusTile
            count={onTrack.length}
            label="On Track"
            Icon={TrendingUp}
          />
          <StatusTile
            count={atRisk.length}
            label="At Risk"
            Icon={AlertTriangle}
          />
          <StatusTile
            count={offTrack.length}
            label="Off Track"
            Icon={XCircle}
          />
        </div>

        {/* Monthly commitment */}
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{
            backgroundColor: brand.soft,
            border: `1px solid ${brand.softBorder}`,
          }}
        >
          <div>
            <p
              className="text-[11px] uppercase tracking-wide font-medium"
              style={{ color: brand.primary }}
            >
              Total monthly commitment
            </p>

            <p className="text-[11px] text-muted-foreground mt-0.5">
              across {active.length} active goal
              {active.length !== 1 ? "s" : ""}
            </p>
          </div>

          <p
            className="text-[22px] font-bold tabular-nums"
            style={{ color: brand.primary }}
          >
            {formatCurrency(Math.round(totalMonthlyNeeded))}
            <span className="text-[13px] font-normal text-muted-foreground">
              /mo
            </span>
          </p>
        </div>

        {/* Needs attention */}
        {needsAttention && (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: brand.soft,
              border: `1px solid ${brand.softBorder}`,
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: brand.primary }}
            >
              Needs attention
            </p>

            <p className="text-sm font-medium" style={{ color: brand.primary }}>
              {needsAttention.title}
            </p>

            <p className="text-[12px] text-muted-foreground mt-0.5">
              Requires{" "}
              <span style={{ color: brand.primary, fontWeight: 600 }}>
                {formatCurrency(
                  Math.round(needsAttention.monthlyContributionNeeded),
                )}
                /mo
              </span>{" "}
              to reach{" "}
              <span style={{ color: brand.primary, fontWeight: 600 }}>
                {formatCurrency(needsAttention.target)}
              </span>
              {needsAttention.targetDate
                ? ` by ${new Date(needsAttention.targetDate).toLocaleDateString(
                    "en-GB",
                    {
                      month: "short",
                      year: "numeric",
                    },
                  )}`
                : ""}
              .
            </p>
          </div>
        )}
      </CardContent>
    </DashCard>
  );
}

function StatusTile({
  count,
  label,
  Icon,
}: {
  count: number;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className="rounded-xl px-3 py-3 ring-1 text-center"
      style={{
        backgroundColor: "rgba(140, 128, 248, 0.08)",
        borderColor: "rgba(140, 128, 248, 0.25)",
      }}
    >
      <div
        className="flex items-center justify-center mb-1"
        style={{ color: brand.accent }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p
        className="text-[22px] font-bold tabular-nums leading-tight"
        style={{ color: brand.primary }}
      >
        {count}
      </p>

      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
