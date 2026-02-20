// ============================================================================
// USER PROFILE
// ============================================================================

export type UserType = "regular" | "enterprise";

export type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  resident_country: string;
  date_of_birth: string; // ISO date string (YYYY-MM-DD)
  user_type: UserType;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const mockUser: User = {
  user_id: "u-1",
  first_name: "John",
  last_name: "Doe",
  email: "john@celerey.co",
  resident_country: "USA",
  date_of_birth: "1982-06-14",
  user_type: "regular",
  currency: "USD",
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
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
