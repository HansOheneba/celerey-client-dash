// lib/onboarding/schemas.ts
import { z } from "zod";

// Use z.number() + valueAsNumber:true in RHF to avoid z.preprocess type mismatches
const num = (min = 0) => z.number().min(min);

const optNum = (min = 0) =>
  z
    .union([z.number().min(min), z.nan()])
    .optional()
    .transform((v) =>
      v === undefined || (typeof v === "number" && isNaN(v))
        ? undefined
        : (v as number),
    );

export const identitySchema = z.object({
  first_name: z.string().min(1, "First name is required").max(25),
  last_name: z.string().min(1, "Last name is required").max(25),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  phone_number: z.string().min(1, "Phone number is required").max(255),
  country: z.string().min(1, "Country is required"),
  resident_city: z.string().min(1, "City is required"),
  preferred_currency: z.string().min(1, "Currency is required").max(3),
  marital_status: z.string().optional(),
  occupation: z.string().max(50).optional(),
});

export const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  target_amount: num(1),
  target_date: z.string().min(1, "Target date is required"),
});

export const incomeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount_monthly: num(0),
  category: z.string().min(1, "Category is required").max(50),
  is_recurring: z.boolean(),
});

export const liabilitySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  liability_type: z.string().min(1, "Type is required").max(30),
  balance: num(0),
  interest_rate_pct: num(0),
  minimum_payment_monthly: num(0),
  due_date: z.string().optional(),
});

export const emergencyFundSchema = z.object({
  cash_balance: num(0),
});

export const retirementSchema = z.object({
  retirement_age: num(18),
  current_invested: num(0),
  monthly_savings: num(0),
  existing_pension_balance: num(0),
  employer_contribution: optNum(0),
  desired_monthly_income: num(0),
});

export type IdentityFormValues = z.infer<typeof identitySchema>;
export type GoalFormValues = z.infer<typeof goalSchema>;
export type IncomeFormValues = z.infer<typeof incomeSchema>;
export type LiabilityFormValues = z.infer<typeof liabilitySchema>;
export type EmergencyFundFormValues = z.infer<typeof emergencyFundSchema>;
export type RetirementFormValues = z.infer<typeof retirementSchema>;
