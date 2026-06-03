import { useRouter } from "next/navigation";
import { TrendingUp, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import {
  DashCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/dash-card";
import { cn } from "@/lib/utils";
import { EnrichedGoal } from "./types";
import { formatCurrency, goalHealth } from "./utils";

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

  // The goal that needs the most attention (off-track first, then highest monthly needed)
  const needsAttention =
    offTrack.sort(
      (a, b) => b.monthlyContributionNeeded - a.monthlyContributionNeeded,
    )[0] ??
    atRisk.sort(
      (a, b) => b.monthlyContributionNeeded - a.monthlyContributionNeeded,
    )[0] ??
    null;

  const aiPrompt = needsAttention
    ? `I need help with my "${needsAttention.title}" goal. I need to save ${formatCurrency(Math.round(needsAttention.monthlyContributionNeeded))}/month to reach ${formatCurrency(needsAttention.target)} by ${needsAttention.targetDate ?? "my target date"}. What should I do?`
    : `Give me a complete analysis of my financial goals and tell me how to reach them faster.`;

  if (active.length === 0) return null;

  return (
    <DashCard className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Goal Health Summary</CardTitle>
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
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
            ringClass="ring-emerald-200"
          />
          <StatusTile
            count={atRisk.length}
            label="At Risk"
            Icon={AlertTriangle}
            colorClass="text-amber-600"
            bgClass="bg-amber-50"
            ringClass="ring-amber-200"
          />
          <StatusTile
            count={offTrack.length}
            label="Off Track"
            Icon={XCircle}
            colorClass="text-rose-600"
            bgClass="bg-rose-50"
            ringClass="ring-rose-200"
          />
        </div>

        {/* Monthly commitment */}
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Total monthly commitment
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              across {active.length} active goal{active.length !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-[22px] font-bold tabular-nums text-foreground">
            {formatCurrency(Math.round(totalMonthlyNeeded))}
            <span className="text-[13px] font-normal text-muted-foreground">
              /mo
            </span>
          </p>
        </div>

        {/* Needs attention callout */}
        {needsAttention && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-1">
              Needs attention
            </p>
            <p className="text-sm font-medium text-foreground">
              {needsAttention.title}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Requires{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(
                  Math.round(needsAttention.monthlyContributionNeeded),
                )}
                /mo
              </span>{" "}
              to reach{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(needsAttention.target)}
              </span>
              {needsAttention.targetDate
                ? ` by ${new Date(needsAttention.targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`
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
  colorClass,
  bgClass,
  ringClass,
}: {
  count: number;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  ringClass: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-3 ring-1 text-center",
        bgClass,
        ringClass,
      )}
    >
      <div className={cn("flex items-center justify-center mb-1", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <p
        className={cn(
          "text-[22px] font-bold tabular-nums leading-tight",
          colorClass,
        )}
      >
        {count}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
