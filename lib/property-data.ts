// ============================================================================
// PROPERTY DATA
// ============================================================================

export type PropertyType =
  | "house"
  | "apartment"
  | "condo"
  | "townhouse"
  | "land"
  | "commercial"
  | "other";

export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

export type InsuranceType =
  | "homeowners"
  | "landlord"
  | "flood"
  | "earthquake"
  | "umbrella"
  | "other";

export const INSURANCE_TYPE_OPTIONS: { value: InsuranceType; label: string }[] =
  [
    { value: "homeowners", label: "Homeowners" },
    { value: "landlord", label: "Landlord" },
    { value: "flood", label: "Flood" },
    { value: "earthquake", label: "Earthquake" },
    { value: "umbrella", label: "Umbrella" },
    { value: "other", label: "Other" },
  ];

export type PropertyInsurance = {
  insurance_type: InsuranceType;
  provider: string;
  policy_number: string;
  coverage_amount: number;
  annual_premium: number;
  deductible: number;
  expiry_date: string;
};

export const COUNTRY_OPTIONS = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Ghana",
  "Nigeria",
  "South Africa",
  "UAE",
  "Singapore",
  "Germany",
  "France",
  "Netherlands",
  "Switzerland",
  "Japan",
  "Other",
] as const;

export type Property = {
  property_id: string;
  user_id: string;
  name: string;
  property_type: PropertyType;
  country: string;
  city: string;
  purchase_date: string;
  market_value: number;
  mortgage_balance: number;
  is_primary: boolean;
  is_active: boolean;
  insurance: PropertyInsurance[];
  created_at: string;
  updated_at: string;
};

// ── Helpers ─────────────────────────────────────────────────────
export function propertyEquity(p: Property): number {
  return p.market_value - p.mortgage_balance;
}

export function propertyLvr(p: Property): number {
  return p.market_value > 0
    ? Math.round((p.mortgage_balance / p.market_value) * 100)
    : 0;
}

export function propertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function findProperty(
  id: string,
  properties: Property[],
): Property | undefined {
  return properties.find((p) => p.property_id === id);
}

export function totalInsurancePremium(p: Property): number {
  return p.insurance.reduce((sum, i) => sum + i.annual_premium, 0);
}

export function totalInsuranceCoverage(p: Property): number {
  return p.insurance.reduce((sum, i) => sum + i.coverage_amount, 0);
}

export function insuranceTypeLabel(type: InsuranceType): string {
  return INSURANCE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function isInsuranceExpiringSoon(policy: PropertyInsurance): boolean {
  const expiry = new Date(policy.expiry_date);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return daysUntilExpiry <= 60 && daysUntilExpiry > 0;
}

export function isInsuranceExpired(policy: PropertyInsurance): boolean {
  return new Date(policy.expiry_date) < new Date();
}

// ── Mock data ───────────────────────────────────────────────────
const now = new Date().toISOString();

export const mockProperties: Property[] = [
  {
    property_id: "p-1",
    user_id: "u-1",
    name: "Primary Residence",
    property_type: "house",
    country: "USA",
    city: "New York",
    purchase_date: "2018-03-12",
    market_value: 850000,
    mortgage_balance: 450000,
    is_primary: true,
    is_active: true,
    insurance: [
      {
        insurance_type: "homeowners",
        provider: "State Farm",
        policy_number: "HO-2024-88412",
        coverage_amount: 850000,
        annual_premium: 2400,
        deductible: 2500,
        expiry_date: "2026-09-15",
      },
      {
        insurance_type: "flood",
        provider: "NFIP",
        policy_number: "FL-2024-33210",
        coverage_amount: 250000,
        annual_premium: 780,
        deductible: 1500,
        expiry_date: "2026-06-01",
      },
    ],
    created_at: now,
    updated_at: now,
  },
  {
    property_id: "p-2",
    user_id: "u-1",
    name: "Rental Unit",
    property_type: "apartment",
    country: "Australia",
    city: "Sydney",
    purchase_date: "2020-07-20",
    market_value: 620000,
    mortgage_balance: 380000,
    is_primary: false,
    is_active: true,
    insurance: [
      {
        insurance_type: "landlord",
        provider: "Allianz",
        policy_number: "LL-2024-55709",
        coverage_amount: 620000,
        annual_premium: 1850,
        deductible: 2000,
        expiry_date: "2026-04-10",
      },
    ],
    created_at: now,
    updated_at: now,
  },
  {
    property_id: "p-3",
    user_id: "u-1",
    name: "Beach House",
    property_type: "house",
    country: "Ghana",
    city: "Accra",
    purchase_date: "2022-01-15",
    market_value: 320000,
    mortgage_balance: 0,
    is_primary: false,
    is_active: true,
    insurance: [],
    created_at: now,
    updated_at: now,
  },
];
