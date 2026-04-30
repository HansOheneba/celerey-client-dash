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

export const identitySchema = z
  .object({
    first_name: z.string().max(25).optional(),
    last_name: z.string().max(25).optional(),
    /** Set to first_name + last_name for solo; entered directly for partner/family */
    display_name: z.string().max(100).optional(),
    /** Only collected for solo accounts */
    date_of_birth: z.string().optional(),
    phone_number: z.string().min(1, "Phone number is required").max(255),
    resident_country: z.string().min(1, "Country is required"),
    resident_city: z.string().min(1, "City is required"),
    currency: z.string().min(1, "Currency is required").max(3),
    account_mode: z.enum(["solo", "partner", "family"]),
    marital_status: z.string().optional(),
    occupation: z.string().max(50).optional(),
    prefix: z.string().optional(),
    gender: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.account_mode === "solo") {
      if (!data.first_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "First name is required",
          path: ["first_name"],
        });
      }
      if (!data.last_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last name is required",
          path: ["last_name"],
        });
      }
      if (!data.date_of_birth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of birth is required",
          path: ["date_of_birth"],
        });
      }
    } else {
      if (!data.display_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Household name is required",
          path: ["display_name"],
        });
      }
    }
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
  /**
   * Only used for solo accounts. Omit for partner/family.
   * retirement_target_year is derived from DOB + retirement_age for solo.
   */
  retirement_age: optNum(18),
  /**
   * Source of truth for all account types.
   * For solo: derived on submit (DOB year + retirement_age).
   * For partner/family: entered directly.
   */
  retirement_target_year: optNum(new Date().getFullYear()),
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
