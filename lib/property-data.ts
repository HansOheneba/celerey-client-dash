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
    created_at: now,
    updated_at: now,
  },
];
