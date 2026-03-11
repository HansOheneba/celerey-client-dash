// ============================================================================
// USER PROFILE
// ============================================================================

export type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  resident_country: string;
  city?: string;
  citizenships?: string[];
  date_of_birth: string; // ISO date string (YYYY-MM-DD)
  user_type: "regular" | "enterprise";
  currency: string;
  preferred_contact?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  occupation?: string;
  marital_status?: "single" | "married" | "divorced" | "widowed";
  risk_profile?: "conservative" | "moderate" | "aggressive";
  dependents?: number;
  bio?: string;
};

export const mockUser: User = {
  user_id: "u-1",
  first_name: "John",
  last_name: "Doe",
  email: "john@celerey.co",
  phone_number: "+1 (555) 012-9090",
  resident_country: "United States",
  city: "New York",
  citizenships: ["United States"],
  date_of_birth: "1982-06-14",
  user_type: "regular",
  currency: "USD",
  preferred_contact: "Email",
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  occupation: "Software Engineer",
  marital_status: "married",
  risk_profile: "moderate",
  dependents: 2,
  bio: "A tech enthusiast and family man focused on building wealth for the future.",
};

// ── helpers ──────────────────────────────────────────────────────────────────

/** Calculate age in whole years from an ISO date string. */
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/** Get the current user's full name. */
export function getUserFullName(user: User = mockUser): string {
  return `${user.first_name} ${user.last_name}`;
}

/** Get the current user's age. */
export function getUserAge(user: User = mockUser): number {
  return calculateAge(user.date_of_birth);
}
