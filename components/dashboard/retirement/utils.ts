export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function compoundFutureValue({
  pv,
  pmt,
  years,
  annualRate,
}: {
  pv: number;
  pmt: number;
  years: number;
  annualRate: number;
}): number {
  const months = Math.max(0, Math.round(years * 12));
  const r = annualRate / 12;

  if (months === 0) return pv;
  if (Math.abs(r) < 1e-9) return pv + pmt * months;

  const factor = Math.pow(1 + r, months);
  return pv * factor + pmt * ((factor - 1) / r);
}

export function requiredNestEgg({
  desiredMonthlyIncomeToday,
  inflationRate,
  years,
  swr,
}: {
  desiredMonthlyIncomeToday: number;
  inflationRate: number;
  years: number;
  swr: number;
}): number {
  const desiredMonthlyAtRetirement =
    desiredMonthlyIncomeToday * Math.pow(1 + inflationRate, years);
  const annualIncomeAtRetirement = desiredMonthlyAtRetirement * 12;
  if (swr <= 0) return Infinity;
  return annualIncomeAtRetirement / swr;
}

export function parseMoney(input: string): number {
  const cleaned = input.replace(/[^\d.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}
