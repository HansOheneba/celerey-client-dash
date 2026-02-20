import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function CelereyInsights() {
  return (
    <Card className="mt-6 border-muted/60 bg-background/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Celerey Cash Flow Insights</CardTitle>
        <Badge variant="secondary" className="gap-1">
          <Lightbulb className="h-3.5 w-3.5" />
          Insights
        </Badge>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-4">
          <div className="text-sm font-semibold text-emerald-900">
            Optimization Opportunity
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Redirecting {formatCurrency(500)}/month from discretionary to goals
            could accelerate your vacation home fund by ~8 months.
          </div>
        </div>

        <div className="rounded-xl border border-sky-200/60 bg-sky-50/60 p-4">
          <div className="text-sm font-semibold text-sky-900">
            Spending Pattern
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Your insurance costs are ~15% below similar profiles. Coverage
            structure appears well optimized.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
