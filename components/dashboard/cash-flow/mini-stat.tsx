import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MiniStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "good";
}) {
  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div
          className={cn(
            "mt-1 text-2xl font-semibold tracking-tight",
            accent === "good" ? "text-emerald-600 dark:text-emerald-500" : "",
          )}
        >
          {value}
        </div>
        {hint ? (
          <div className="mt-1 text-sm text-muted-foreground">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
