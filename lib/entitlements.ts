import { SubscriptionStatus } from "./storage";

export type FeatureKey = "premiumInsights" | "exportData" | "advisorChat";

export const trialDisabledFeatures: FeatureKey[] = [
  "premiumInsights",
  "exportData",
  "advisorChat",
];

export function canAccessFeature(
  status: SubscriptionStatus,
  feature: FeatureKey,
): boolean {
  if (status === "active") return true;
  if (status === "trialing") {
    return !trialDisabledFeatures.includes(feature);
  }
  return false;
}
