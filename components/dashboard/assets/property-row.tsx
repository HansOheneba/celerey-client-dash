import { Card, CardContent } from "@/components/ui/card";

export type PropertyAsset = {
  id: string;
  name: string;
  location: string;
  value: number;
  loan: number;
  equity: number;
  lvr?: number; // 0..100
  monthlyRent?: number;
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PropertyRow({ item }: { item: PropertyAsset }) {
  return (
    <Card className="border-muted/60 bg-background/60 shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-base font-semibold">{item.name}</div>
            <div className="text-sm text-muted-foreground">{item.location}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Value</div>
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(item.value)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Loan</div>
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(item.loan)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Equity</div>
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(item.equity)}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">LVR</div>
              <div className="text-sm font-semibold tabular-nums">
                {typeof item.lvr === "number" ? `${item.lvr}%` : "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Monthly Rent</div>
              <div className="text-sm font-semibold tabular-nums">
                {typeof item.monthlyRent === "number"
                  ? formatCurrency(item.monthlyRent)
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
