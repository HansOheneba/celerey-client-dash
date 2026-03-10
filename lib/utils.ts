import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { mockUser } from "@/lib/user-data";
/** The current user's currency code (e.g. "USD", "GHS"). */
export const userCurrency: string = mockUser.currency;
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency using the current user's preferred currency.
 * Pass an explicit currency code to override.
 */
export function formatCurrency(n: number, currency?: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency ?? mockUser.currency,
    maximumFractionDigits: 0,
  }).format(n);
}
