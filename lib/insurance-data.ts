// ============================================================================
// INSURANCE DATA
// ============================================================================

// ── General insurance categories (non-property) ─────────────────
export type GeneralInsuranceCategory =
  | "life"
  | "health"
  | "auto"
  | "disability"
  | "liability"
  | "travel"
  | "pet"
  | "other";

export const GENERAL_INSURANCE_CATEGORIES: {
  value: GeneralInsuranceCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "life",
    label: "Life Insurance",
    description: "Term, whole-life, or universal life policies",
  },
  {
    value: "health",
    label: "Health Insurance",
    description: "Medical, dental, and vision coverage",
  },
  {
    value: "auto",
    label: "Auto Insurance",
    description: "Vehicle liability, collision, and comprehensive",
  },
  {
    value: "disability",
    label: "Disability Insurance",
    description: "Short-term and long-term disability income",
  },
  {
    value: "liability",
    label: "Personal Liability",
    description: "Umbrella and excess liability policies",
  },
  {
    value: "travel",
    label: "Travel Insurance",
    description: "Trip cancellation, medical abroad, baggage",
  },
  {
    value: "pet",
    label: "Pet Insurance",
    description: "Veterinary and accident coverage for pets",
  },
  {
    value: "other",
    label: "Other",
    description: "Any other insurance type",
  },
];

export type InsuranceStatus =
  | "active"
  | "expiring_soon"
  | "expired"
  | "cancelled";

export type InsurancePolicy = {
  policy_id: string;
  user_id: string;
  category: GeneralInsuranceCategory;
  provider: string;
  policy_name: string;
  policy_number: string;
  coverage_amount: number;
  annual_premium: number;
  deductible: number;
  start_date: string;
  expiry_date: string;
  auto_renew: boolean;
  beneficiary: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// ── Helpers ─────────────────────────────────────────────────────
export function categoryLabel(cat: GeneralInsuranceCategory): string {
  return (
    GENERAL_INSURANCE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat
  );
}

export function categoryDescription(cat: GeneralInsuranceCategory): string {
  return (
    GENERAL_INSURANCE_CATEGORIES.find((c) => c.value === cat)?.description ?? ""
  );
}

export function policyStatus(policy: InsurancePolicy): InsuranceStatus {
  if (!policy.is_active) return "cancelled";
  const now = new Date();
  const expiry = new Date(policy.expiry_date);
  if (expiry < now) return "expired";
  const daysUntil = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysUntil <= 60) return "expiring_soon";
  return "active";
}

export function statusLabel(status: InsuranceStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "expiring_soon":
      return "Expiring Soon";
    case "expired":
      return "Expired";
    case "cancelled":
      return "Cancelled";
  }
}

export function totalAnnualPremiums(policies: InsurancePolicy[]): number {
  return policies
    .filter((p) => p.is_active)
    .reduce((s, p) => s + p.annual_premium, 0);
}

export function totalCoverageAmount(policies: InsurancePolicy[]): number {
  return policies
    .filter((p) => p.is_active)
    .reduce((s, p) => s + p.coverage_amount, 0);
}

export function policiesByCategory(
  policies: InsurancePolicy[],
): Record<GeneralInsuranceCategory, InsurancePolicy[]> {
  const grouped = {} as Record<GeneralInsuranceCategory, InsurancePolicy[]>;
  for (const cat of GENERAL_INSURANCE_CATEGORIES) {
    grouped[cat.value] = policies.filter((p) => p.category === cat.value);
  }
  return grouped;
}

// ── Mock data ───────────────────────────────────────────────────
const now = new Date().toISOString();

export const mockInsurancePolicies: InsurancePolicy[] = [
  {
    policy_id: "ins-1",
    user_id: "u-1",
    category: "life",
    provider: "MetLife",
    policy_name: "Term Life 20-Year",
    policy_number: "ML-2022-44190",
    coverage_amount: 1000000,
    annual_premium: 1200,
    deductible: 0,
    start_date: "2022-01-15",
    expiry_date: "2042-01-15",
    auto_renew: false,
    beneficiary: "Spouse",
    notes: "20-year level term policy",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    policy_id: "ins-2",
    user_id: "u-1",
    category: "health",
    provider: "Blue Cross Blue Shield",
    policy_name: "PPO Family Plan",
    policy_number: "BC-2025-88320",
    coverage_amount: 0,
    annual_premium: 9600,
    deductible: 3000,
    start_date: "2025-01-01",
    expiry_date: "2025-12-31",
    auto_renew: true,
    beneficiary: "",
    notes: "Family PPO plan through employer",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    policy_id: "ins-3",
    user_id: "u-1",
    category: "auto",
    provider: "GEICO",
    policy_name: "Full Coverage - Tesla Model 3",
    policy_number: "GK-2025-55412",
    coverage_amount: 300000,
    annual_premium: 2100,
    deductible: 1000,
    start_date: "2025-06-01",
    expiry_date: "2026-06-01",
    auto_renew: true,
    beneficiary: "",
    notes: "Liability + collision + comprehensive",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    policy_id: "ins-4",
    user_id: "u-1",
    category: "disability",
    provider: "Unum",
    policy_name: "Long-Term Disability",
    policy_number: "UN-2023-33100",
    coverage_amount: 120000,
    annual_premium: 960,
    deductible: 0,
    start_date: "2023-03-01",
    expiry_date: "2026-03-01",
    auto_renew: true,
    beneficiary: "",
    notes: "60% income replacement, 90-day elimination period",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    policy_id: "ins-5",
    user_id: "u-1",
    category: "liability",
    provider: "Chubb",
    policy_name: "Personal Umbrella",
    policy_number: "CH-2024-77001",
    coverage_amount: 2000000,
    annual_premium: 450,
    deductible: 0,
    start_date: "2024-07-01",
    expiry_date: "2026-07-01",
    auto_renew: true,
    beneficiary: "",
    notes: "Excess liability beyond auto and homeowners",
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];
