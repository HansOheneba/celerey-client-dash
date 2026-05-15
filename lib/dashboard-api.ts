// lib/dashboard-api.ts
//
// Typed client-side functions that call the /api/proxy route.
// All data-shape mappers live here so the store only ever sees internal types.

import type {
  Goal,
  GoalCategory,
  InsurancePolicy,
  AssetHolding,
  Property,
  CashFlowRow,
  ExpenseCategory,
  RetirementConfig,
  CashFlowPoint,
  Liability,
  LiabilityType,
  SubscriptionEntitlements,
  SubscriptionRecordLimits,
} from "@/lib/client-data";
import { calculateAge } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";

// ── Session-expiry error ───────────────────────────────────────────────────

export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "SessionExpiredError";
  }
}

// ── Low-level proxy caller ─────────────────────────────────────────────────

async function attemptProxyCall<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body: unknown,
): Promise<{ res: Response; data: T }> {
  console.log(`[API ▶] ${method} ${path}`, body !== undefined ? body : "");
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, method, body }),
  });
  const data = await res.json();
  console.log(`[API ◀] ${method} ${path} — HTTP ${res.status}`, data);
  return { res, data: data as T };
}

async function proxyCall<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  let { res, data } = await attemptProxyCall<T>(path, method, body);

  // On 401, attempt a token refresh and retry once
  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshRes.ok) {
      const retried = await attemptProxyCall<T>(path, method, body);
      res = retried.res;
      data = retried.data;
    }
  }

  if (res.status === 401) {
    throw new SessionExpiredError();
  }

  if (!res.ok || (data as Record<string, unknown>)?.success === false) {
    throw new Error(
      ((data as Record<string, unknown>)?.message as string) ??
        ((data as Record<string, unknown>)?.error as string) ??
        "API error",
    );
  }
  return data;
}

// ── Raw API response shapes ────────────────────────────────────────────────

interface ApiGoal {
  goal_id: string;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  priority?: number;
  status?: string;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiIncome {
  id: string;
  name: string;
  amount?: number; // field name used by create/update
  amount_monthly?: number; // field name used by find response
  category?: string;
  source_currency?: string;
  recurring_type?: string; // field name used by create/update
  is_recurring?: boolean; // field name used by find response
  start_date?: string;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ApiExpense {
  id: string;
  name: string;
  amount?: number; // field name used by create/update
  amount_monthly?: number; // field name used by find response
  category?: string;
  essential?: boolean;
  source_currency?: string;
  recurring_type?: string; // field name used by create/update
  is_recurring?: boolean; // field name used by find response
  start_date?: string;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ApiEmergencyFund {
  cash_balance: number;
  target_months: number;
}

interface ApiRetirement {
  retirement_target_year?: number;
  retirement_age?: number;
  current_invested?: number;
  monthly_savings?: number;
  existing_pension_balance?: number;
  employer_contribution?: number;
  desired_monthly_income?: number;
}

interface ApiHistoryPoint {
  month: string;
  income?: number;
  expenses?: number;
  surplus?: number;
}

interface ApiUser {
  user_id: string;
  display_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  phone_number?: string;
  resident_country: string;
  city?: string;
  date_of_birth?: string | null;
  user_type?: string;
  currency: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  occupation?: string | null;
  marital_status?: string | null;
  prefix?: string | null;
  gender?: string | null;
  account_mode?: string;
  risk_profile?: string | null;
  dependents?: number | null;
  bio?: string | null;
  citizenships?: string[] | null;
  preferred_contact?: string | null;
}

interface ApiLiability {
  id: string;
  name: string;
  lender?: string | null;
  type: string;
  balance?: number;
  amount?: number; // fallback field name some APIs use
  interestRatePct?: number;
  minPaymentMonthly?: number;
  dueDay?: number | null;
  originalLoanAmount?: number | null;
  expectedPayoffDate?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApiScenario {
  id: string;
  label?: string;
  name?: string; // some APIs return name instead of label
  description?: string;
  monthly_return_rate?: number;
  inflation_rate?: number;
  monthly_multiplier?: number;
}

interface ApiCashFlowSummary {
  total_income?: number;
  total_expenses?: number;
  surplus?: number;
  savings_rate?: number;
  burn_rate?: number;
  [key: string]: unknown;
}

// ── Data mappers ───────────────────────────────────────────────────────────

function msPerYear() {
  return 1000 * 60 * 60 * 24 * 365.25;
}

function apiGoalToStore(g: ApiGoal, index: number): Goal {
  const targetDate = g.target_date
    ? new Date(g.target_date).toISOString().split("T")[0]
    : undefined;
  const yearsRemaining = targetDate
    ? Math.max(
        0,
        Math.round((new Date(targetDate).getTime() - Date.now()) / msPerYear()),
      )
    : 0;
  const remaining = Math.max(
    0,
    Number(g.target_amount) - Number(g.current_amount),
  );
  const completed =
    g.status === "completed" ||
    Number(g.current_amount) >= Number(g.target_amount);

  return {
    id: g.goal_id,
    userId: g.user_id,
    title: g.title,
    // API does not return category — default to "other"; round-trip via icon field when available
    category: (g.category as GoalCategory | undefined) ?? "other",
    description: g.description,
    priority: g.priority ?? index + 1,
    target: Number(g.target_amount) || 0,
    current: Number(g.current_amount) || 0,
    yearsRemaining,
    completed,
    targetDate,
    monthlyContributionNeeded:
      yearsRemaining > 0 ? Math.ceil(remaining / (yearsRemaining * 12)) : 0,
    probability: 50,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  };
}

function apiLiabilityToStore(l: ApiLiability): Liability {
  return {
    id: l.id,
    name: l.name,
    lender: l.lender ?? undefined,
    type: (l.type as LiabilityType) ?? "other",
    balance: Number(l.balance ?? l.amount) || 0,
    interestRatePct: Number(l.interestRatePct) || 0,
    minPaymentMonthly: Number(l.minPaymentMonthly) || 0,
    dueDay: l.dueDay ?? undefined,
    originalLoanAmount: l.originalLoanAmount ?? undefined,
    expectedPayoffDate: l.expectedPayoffDate ?? undefined,
    updatedAt: l.updated_at ?? new Date().toISOString(),
  };
}

function apiIncomeToStore(i: ApiIncome): CashFlowRow {
  return {
    id: i.id,
    name: i.name,
    amount: Number(i.amount ?? i.amount_monthly) || 0,
    isRecurring: i.recurring_type !== "one-time" && (i.is_recurring ?? true),
    recurringType: i.recurring_type === "one-time" ? "one-time" : "forever",
    startDate: i.start_date,
  };
}

function apiExpenseToStore(e: ApiExpense): ExpenseCategory {
  return {
    id: e.id,
    name: e.name,
    amount: Number(e.amount ?? e.amount_monthly) || 0,
    essential: e.essential ?? false,
    isRecurring: e.recurring_type !== "one-time" && (e.is_recurring ?? true),
    recurringType: e.recurring_type === "one-time" ? "one-time" : "forever",
    startDate: e.start_date,
  };
}

function apiRetirementToStore(
  r: ApiRetirement,
  dateOfBirth?: string | null,
): RetirementConfig {
  const currentAge = dateOfBirth ? calculateAge(dateOfBirth) : 0;
  const retirementAge =
    r.retirement_age ??
    (r.retirement_target_year !== undefined
      ? r.retirement_target_year - new Date().getFullYear() + currentAge
      : 0);

  return {
    currentAge,
    retirementAge: Math.max(0, retirementAge),
    lifeExpectancy: 85,
    currentInvested: Number(r.current_invested) || 0,
    monthlySavings: Number(r.monthly_savings) || 0,
    existingPensionBalance: Number(r.existing_pension_balance) || 0,
    monthlyPensionContribution: Number(r.employer_contribution) || 0,
    desiredMonthlyIncome: Number(r.desired_monthly_income) || 0,
    expectedReturnPct: 7,
    inflationPct: 2,
    safeWithdrawalRatePct: 4,
  };
}

// ── Fetch functions ────────────────────────────────────────────────────────

export async function fetchUser(): Promise<ApiUser | null> {
  try {
    const res = await proxyCall<{ data?: ApiUser; success?: boolean }>(
      "user.get",
    );
    console.log("[fetchUser] raw API response:", res);
    return (res as { data?: ApiUser }).data ?? (res as unknown as ApiUser);
  } catch (err) {
    console.warn("[fetchUser] failed:", err);
    return null;
  }
}

export async function updateUser(payload: {
  [key: string]: unknown;
}): Promise<ApiUser | null> {
  try {
    const res = await proxyCall<{ data?: ApiUser }>(
      "user.update",
      "PUT",
      payload,
    );
    console.log("[updateUser] raw API response:", res);
    return (res as { data?: ApiUser }).data ?? (res as unknown as ApiUser);
  } catch (err) {
    console.warn("[updateUser] failed:", err);
    return null;
  }
}

export async function fetchGoals(): Promise<Goal[]> {
  const res = await proxyCall<{
    data?: ApiGoal[] | { goals?: ApiGoal[] };
    success?: boolean;
  }>("goals.find");
  console.log("[fetchGoals] raw API response:", res);
  const data = (res as { data?: unknown }).data;
  const list: ApiGoal[] = Array.isArray(res)
    ? (res as unknown as ApiGoal[])
    : Array.isArray(data)
      ? (data as ApiGoal[])
      : ((data as { goals?: ApiGoal[] })?.goals ?? []);
  console.log("[fetchGoals] mapped list:", list);
  return list.map((g, i) => apiGoalToStore(g, i));
}

export async function createGoal(payload: {
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority?: number;
  status?: string;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
}): Promise<ApiGoal> {
  const res = await proxyCall<{ data?: ApiGoal }>(
    "goals.create",
    "POST",
    payload,
  );
  return (res as { data?: ApiGoal }).data ?? (res as unknown as ApiGoal);
}

export async function updateGoal(payload: {
  goal_id: string;
  [key: string]: unknown;
}): Promise<ApiGoal> {
  const res = await proxyCall<{ data?: ApiGoal }>(
    "goals.update",
    "PUT",
    payload,
  );
  return (res as { data?: ApiGoal }).data ?? (res as unknown as ApiGoal);
}

export async function deleteGoal(goalId: string): Promise<void> {
  await proxyCall(`goals.delete?goal_id=${goalId}`, "DELETE");
}

export async function reorderGoalPriorities(
  priorities: { goal_id: string; priority: number }[],
): Promise<void> {
  await proxyCall("goals.priorities", "PUT", { priorities });
}

export async function fetchGoalScenarios(): Promise<ApiScenario[]> {
  try {
    const res = await proxyCall<{ data?: ApiScenario[] }>("goals.scenarios");
    console.log("[fetchGoalScenarios] raw API response:", res);
    const list: ApiScenario[] = Array.isArray(res)
      ? (res as unknown as ApiScenario[])
      : ((res as { data?: ApiScenario[] }).data ?? []);
    return list;
  } catch (err) {
    console.warn("[fetchGoalScenarios] failed, using fallback:", err);
    return [];
  }
}

export async function fetchIncome(): Promise<CashFlowRow[]> {
  const res = await proxyCall<{ data?: ApiIncome[] }>(
    "cashflow.income.find?is_active=true",
  );
  const list: ApiIncome[] = Array.isArray(res)
    ? (res as unknown as ApiIncome[])
    : ((res as { data?: ApiIncome[] }).data ?? []);
  return list.map(apiIncomeToStore);
}

export async function createIncome(payload: {
  name: string;
  amount: number;
  category?: string;
  source_currency?: string;
  recurring_type?: string;
  start_date?: string;
  end_date?: string | null;
}): Promise<CashFlowRow> {
  const currency = useFinancialStore.getState().user?.currency ?? "USD";
  const body = {
    name: payload.name,
    category: payload.category || "Other",
    amount: payload.amount,
    source_currency: payload.source_currency ?? currency,
    recurring_type: payload.recurring_type ?? "monthly",
    start_date: payload.start_date ?? new Date().toISOString().split("T")[0],
    end_date: payload.end_date ?? null,
  };
  const res = await proxyCall<{ data?: ApiIncome }>(
    "cashflow.income.create",
    "POST",
    body,
  );
  const raw =
    (res as { data?: ApiIncome }).data ?? (res as unknown as ApiIncome);
  return apiIncomeToStore(raw);
}

export async function updateIncome(payload: {
  id: string;
  [key: string]: unknown;
}): Promise<CashFlowRow> {
  const res = await proxyCall<{ data?: ApiIncome }>(
    "cashflow.income.update",
    "PUT",
    payload,
  );
  const raw =
    (res as { data?: ApiIncome }).data ?? (res as unknown as ApiIncome);
  return apiIncomeToStore(raw);
}

export async function deleteIncome(id: string): Promise<void> {
  await proxyCall(`cashflow.income.delete?id=${id}`, "DELETE");
}

export async function fetchExpenses(): Promise<ExpenseCategory[]> {
  const res = await proxyCall<{ data?: ApiExpense[] }>(
    "cashflow.expense.find?is_active=true",
  );
  const list: ApiExpense[] = Array.isArray(res)
    ? (res as unknown as ApiExpense[])
    : ((res as { data?: ApiExpense[] }).data ?? []);
  return list.map(apiExpenseToStore);
}

export async function createExpense(payload: {
  name: string;
  amount: number;
  category?: string;
  source_currency?: string;
  recurring_type?: string;
  start_date?: string;
  end_date?: string | null;
  essential?: boolean;
}): Promise<ExpenseCategory> {
  const currency = useFinancialStore.getState().user?.currency ?? "USD";
  const body = {
    name: payload.name,
    category: payload.category || "Other",
    amount: payload.amount,
    source_currency: payload.source_currency ?? currency,
    recurring_type: payload.recurring_type ?? "monthly",
    start_date: payload.start_date ?? new Date().toISOString().split("T")[0],
    end_date: payload.end_date ?? null,
    essential: payload.essential ?? false,
  };
  const res = await proxyCall<{ data?: ApiExpense }>(
    "cashflow.expense.create",
    "POST",
    body,
  );
  const raw =
    (res as { data?: ApiExpense }).data ?? (res as unknown as ApiExpense);
  return apiExpenseToStore(raw);
}

export async function updateExpense(payload: {
  id: string;
  [key: string]: unknown;
}): Promise<ExpenseCategory> {
  const res = await proxyCall<{ data?: ApiExpense }>(
    "cashflow.expense.update",
    "PUT",
    payload,
  );
  const raw =
    (res as { data?: ApiExpense }).data ?? (res as unknown as ApiExpense);
  return apiExpenseToStore(raw);
}

export async function deleteExpense(id: string): Promise<void> {
  await proxyCall(`cashflow.expense.delete?id=${id}`, "DELETE");
}

export async function fetchEmergencyFund(): Promise<ApiEmergencyFund | null> {
  try {
    const res = await proxyCall<{ data?: ApiEmergencyFund }>(
      "cashflow.emergency-fund.find",
    );
    return (
      (res as { data?: ApiEmergencyFund }).data ??
      (res as unknown as ApiEmergencyFund)
    );
  } catch {
    return null;
  }
}

export async function updateEmergencyFund(payload: {
  cash_balance: number;
  target_months: number;
}): Promise<void> {
  await proxyCall("cashflow.emergency-fund.update", "PUT", payload);
}

export async function fetchCashFlowSummary(): Promise<ApiCashFlowSummary | null> {
  try {
    const res = await proxyCall<{ data?: ApiCashFlowSummary }>(
      "cashflow.summary",
    );
    console.log("[fetchCashFlowSummary] raw API response:", res);
    return (
      (res as { data?: ApiCashFlowSummary }).data ??
      (res as unknown as ApiCashFlowSummary)
    );
  } catch (err) {
    console.warn("[fetchCashFlowSummary] failed:", err);
    return null;
  }
}

export async function fetchCashFlowHistory(): Promise<CashFlowPoint[]> {
  try {
    const res = await proxyCall<{ data?: ApiHistoryPoint[] }>(
      "cashflow.history.find?limit=12",
    );
    const list: ApiHistoryPoint[] = Array.isArray(res)
      ? (res as unknown as ApiHistoryPoint[])
      : ((res as { data?: ApiHistoryPoint[] }).data ?? []);
    return list.map((p) => ({
      month: p.month,
      income: Number(p.income) || 0,
      expenses: Number(p.expenses) || 0,
      surplus: p.surplus != null ? Number(p.surplus) : undefined,
    }));
  } catch {
    return [];
  }
}

function mapApiHolding(raw: Record<string, unknown>): AssetHolding {
  return {
    ...(raw as unknown as AssetHolding),
    cost_basis: Number(raw.cost_basis) || 0,
    initial_value:
      raw.initial_value != null ? Number(raw.initial_value) : undefined,
    amount_invested:
      raw.amount_invested != null ? Number(raw.amount_invested) : undefined,
    current_value:
      raw.current_value != null ? Number(raw.current_value) || undefined : undefined,
    quantity: raw.quantity != null ? Number(raw.quantity) : undefined,
    coupon_rate:
      raw.coupon_rate != null ? Number(raw.coupon_rate) || undefined : undefined,
  };
}

export async function fetchAssets(): Promise<AssetHolding[]> {
  const res = await proxyCall<{ data?: AssetHolding[] }>("assets.find");
  const list: Record<string, unknown>[] = Array.isArray(res)
    ? (res as unknown as Record<string, unknown>[])
    : (((res as { data?: unknown[] }).data ?? []) as Record<string, unknown>[]);
  return list.map(mapApiHolding);
}

export async function createAsset(
  payload: Partial<AssetHolding>,
): Promise<AssetHolding> {
  const res = await proxyCall<{ data?: AssetHolding }>(
    "assets.create",
    "POST",
    payload,
  );
  return (
    (res as { data?: AssetHolding }).data ?? (res as unknown as AssetHolding)
  );
}

export async function updateAsset(payload: {
  holding_id: string;
  [key: string]: unknown;
}): Promise<AssetHolding> {
  const res = await proxyCall<{ data?: AssetHolding }>(
    "assets.update",
    "PUT",
    payload,
  );
  return (
    (res as { data?: AssetHolding }).data ?? (res as unknown as AssetHolding)
  );
}

export async function deleteAsset(holdingId: string): Promise<void> {
  await proxyCall(`assets.delete?holding_id=${holdingId}`, "DELETE");
}

export async function createAssetValuation(payload: {
  holding_id: string;
  value: number;
  as_of: string;
  source?: string;
  notes?: string;
}): Promise<Record<string, unknown>> {
  const res = await proxyCall<{ data?: Record<string, unknown> }>(
    "assets.valuation.create",
    "POST",
    payload,
  );
  console.log("[createAssetValuation] raw API response:", res);
  return (
    (res as { data?: Record<string, unknown> }).data ??
    (res as unknown as Record<string, unknown>)
  );
}

function mapApiInsurancePolicy(raw: Record<string, unknown>): InsurancePolicy {
  return {
    ...(raw as unknown as InsurancePolicy),
    coverage_amount: Number(raw.coverage_amount) || 0,
    premium_monthly: Number(raw.premium_monthly) || 0,
    deductible: Number(raw.deductible) || 0,
  };
}

export async function fetchInsurancePolicies(): Promise<InsurancePolicy[]> {
  const res = await proxyCall<{ data?: InsurancePolicy[] }>("insurance.find");
  const list: Record<string, unknown>[] = Array.isArray(res)
    ? (res as unknown as Record<string, unknown>[])
    : (((res as { data?: unknown[] }).data ?? []) as Record<string, unknown>[]);
  return list.map(mapApiInsurancePolicy);
}

export async function createInsurancePolicy(
  payload: Partial<InsurancePolicy>,
): Promise<InsurancePolicy> {
  const res = await proxyCall<{ data?: InsurancePolicy }>(
    "insurance.create",
    "POST",
    payload,
  );
  return (
    (res as { data?: InsurancePolicy }).data ??
    (res as unknown as InsurancePolicy)
  );
}

export async function updateInsurancePolicy(payload: {
  policy_id: string;
  [key: string]: unknown;
}): Promise<InsurancePolicy> {
  const res = await proxyCall<{ data?: InsurancePolicy }>(
    "insurance.update",
    "PUT",
    payload,
  );
  return (
    (res as { data?: InsurancePolicy }).data ??
    (res as unknown as InsurancePolicy)
  );
}

export async function deleteInsurancePolicy(policyId: string): Promise<void> {
  await proxyCall(`insurance.delete?policy_id=${policyId}`, "DELETE");
}

// ── Liabilities ────────────────────────────────────────────────────────────

export async function fetchLiabilities(): Promise<Liability[]> {
  const res = await proxyCall<{ data?: ApiLiability[] }>(
    "liabilities.find?is_active=true",
  );
  console.log("[fetchLiabilities] raw API response:", res);
  const list: ApiLiability[] = Array.isArray(res)
    ? (res as unknown as ApiLiability[])
    : ((res as { data?: ApiLiability[] }).data ?? []);
  return list.map(apiLiabilityToStore);
}

export async function createLiability(payload: {
  name: string;
  type: string;
  balance: number;
  interestRatePct?: number;
  minPaymentMonthly?: number;
  lender?: string;
  dueDay?: number;
  originalLoanAmount?: number;
  expectedPayoffDate?: string;
}): Promise<Liability> {
  const res = await proxyCall<{ data?: ApiLiability }>(
    "liabilities.create",
    "POST",
    payload,
  );
  console.log("[createLiability] raw API response:", res);
  const raw =
    (res as { data?: ApiLiability }).data ?? (res as unknown as ApiLiability);
  return apiLiabilityToStore(raw);
}

export async function updateLiability(payload: {
  id: string;
  [key: string]: unknown;
}): Promise<Liability> {
  const res = await proxyCall<{ data?: ApiLiability }>(
    "liabilities.update",
    "PUT",
    payload,
  );
  console.log("[updateLiability] raw API response:", res);
  const raw =
    (res as { data?: ApiLiability }).data ?? (res as unknown as ApiLiability);
  return apiLiabilityToStore(raw);
}

export async function deleteLiability(id: string): Promise<void> {
  await proxyCall(`liabilities.delete?id=${id}`, "DELETE");
}

// Coerce numeric string fields the API returns as decimal strings ("3233232.00").
function coerceProperty(p: Record<string, unknown>): Property {
  const coerceNum = (v: unknown) => (v == null ? 0 : Number(v) || 0);
  return {
    ...p,
    market_value: coerceNum(p.market_value),
    mortgage_balance: coerceNum(p.mortgage_balance),
    purchase_price:
      p.purchase_price != null ? Number(p.purchase_price) || 0 : null,
    mortgage: p.mortgage
      ? {
          ...(p.mortgage as Record<string, unknown>),
          balance: coerceNum((p.mortgage as Record<string, unknown>).balance),
          monthly_payment: coerceNum(
            (p.mortgage as Record<string, unknown>).monthly_payment,
          ),
          original_amount: coerceNum(
            (p.mortgage as Record<string, unknown>).original_amount,
          ),
        }
      : undefined,
    additional_liens: Array.isArray(p.additional_liens)
      ? (p.additional_liens as Record<string, unknown>[]).map((l) => ({
          ...l,
          balance: coerceNum(l.balance),
        }))
      : [],
    insurance: Array.isArray(p.insurance)
      ? (p.insurance as Record<string, unknown>[]).map((ins) => ({
          ...ins,
          coverage_amount: coerceNum(ins.coverage_amount),
          annual_premium: coerceNum(ins.annual_premium),
          deductible: coerceNum(ins.deductible),
        }))
      : [],
  } as unknown as Property;
}

export async function fetchProperties(): Promise<Property[]> {
  const res = await proxyCall<{ data?: unknown[] }>("properties.find");
  const list: Record<string, unknown>[] = Array.isArray(res)
    ? (res as unknown as Record<string, unknown>[])
    : (((res as { data?: unknown[] }).data ?? []) as Record<string, unknown>[]);
  return list.map(coerceProperty);
}

export async function createProperty(
  payload: Partial<Property>,
): Promise<Property> {
  const res = await proxyCall<{ data?: Property }>(
    "properties.create",
    "POST",
    payload,
  );
  return (res as { data?: Property }).data ?? (res as unknown as Property);
}

export async function updateProperty(payload: {
  property_id: string;
  [key: string]: unknown;
}): Promise<Property> {
  const res = await proxyCall<{ data?: Property }>(
    "properties.update",
    "PUT",
    payload,
  );
  return (res as { data?: Property }).data ?? (res as unknown as Property);
}

export async function deleteProperty(propertyId: string): Promise<void> {
  await proxyCall(`properties.delete?property_id=${propertyId}`, "DELETE");
}

export async function updatePropertyMortgage(payload: {
  property_id: string;
  [key: string]: unknown;
}): Promise<void> {
  await proxyCall("properties.mortgage.update", "PUT", payload);
}

export async function removePropertyMortgage(payload: {
  property_id: string;
}): Promise<void> {
  await proxyCall("properties.mortgage.remove", "PUT", payload);
}

export async function fetchPropertyById(
  propertyId: string,
): Promise<Property | null> {
  try {
    const res = await proxyCall<{ data?: unknown }>(
      `properties.find-one?property_id=${propertyId}`,
    );
    console.log("[fetchPropertyById] raw API response:", res);
    const raw = (res as { data?: unknown }).data ?? (res as unknown);
    return coerceProperty(raw as Record<string, unknown>);
  } catch (err) {
    console.warn("[fetchPropertyById] failed:", err);
    return null;
  }
}

export async function updatePropertyInsurance(payload: {
  property_id: string;
  insurance: unknown[];
}): Promise<void> {
  await proxyCall("properties.insurance.update", "PUT", payload);
}

// ── Retirement ────────────────────────────────────────────────────────────

// API shape: { success, data: { config: RetirementConfig, projections: ... } }
type ApiRetirementResponse = {
  success?: boolean;
  data?: {
    config?: RetirementConfig;
    projections?: unknown;
  };
};

function extractRetirementConfig(res: unknown): RetirementConfig | null {
  const typed = res as ApiRetirementResponse;
  // currentAge is intentionally excluded — it is always derived from the user's
  // date_of_birth after extraction, never trusted from the API payload.

  // Primary: { data: { config: {...} } }
  if (typed?.data?.config) {
    const c = typed.data.config;
    return {
      currentAge: 0, // will be overridden from DOB
      retirementAge: Number(c.retirementAge) || 0,
      lifeExpectancy: Number(c.lifeExpectancy) || 85,
      currentInvested: Number(c.currentInvested) || 0,
      monthlySavings: Number(c.monthlySavings) || 0,
      existingPensionBalance: Number(c.existingPensionBalance) || 0,
      monthlyPensionContribution: Number(c.monthlyPensionContribution) || 0,
      expectedReturnPct: Number(c.expectedReturnPct) || 7,
      inflationPct: Number(c.inflationPct) || 2,
      safeWithdrawalRatePct: Number(c.safeWithdrawalRatePct) || 4,
      desiredMonthlyIncome: Number(c.desiredMonthlyIncome) || 0,
    };
  }
  // Fallback: data is the config directly
  if (typed?.data && "retirementAge" in typed.data) {
    const c = typed.data as unknown as RetirementConfig;
    return {
      currentAge: 0, // will be overridden from DOB
      retirementAge: Number(c.retirementAge) || 0,
      lifeExpectancy: Number(c.lifeExpectancy) || 85,
      currentInvested: Number(c.currentInvested) || 0,
      monthlySavings: Number(c.monthlySavings) || 0,
      existingPensionBalance: Number(c.existingPensionBalance) || 0,
      monthlyPensionContribution: Number(c.monthlyPensionContribution) || 0,
      expectedReturnPct: Number(c.expectedReturnPct) || 7,
      inflationPct: Number(c.inflationPct) || 2,
      safeWithdrawalRatePct: Number(c.safeWithdrawalRatePct) || 4,
      desiredMonthlyIncome: Number(c.desiredMonthlyIncome) || 0,
    };
  }
  return null;
}

export async function fetchRetirement(): Promise<RetirementConfig | null> {
  console.log("[fetchRetirement] ▶ calling retirement.find");
  try {
    const res = await proxyCall<ApiRetirementResponse>("retirement.find");
    console.log(
      "[fetchRetirement] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    const config = extractRetirementConfig(res);
    console.log("[fetchRetirement] ◀ extracted config:", config);

    // Always derive currentAge from the user's date_of_birth, never from the API
    if (config) {
      const dob = useFinancialStore.getState().user?.date_of_birth;
      config.currentAge = dob ? calculateAge(dob) : 0;
      console.log(
        "[fetchRetirement] ◀ currentAge from DOB:",
        config.currentAge,
      );
    }

    return config;
  } catch (err) {
    console.error("[fetchRetirement] ✗ error:", err);
    return null;
  }
}

export async function updateRetirement(
  config: RetirementConfig,
): Promise<RetirementConfig | null> {
  // Always inject the DOB-derived age — never send a user-supplied value
  const dob = useFinancialStore.getState().user?.date_of_birth;
  const payload: RetirementConfig = {
    ...config,
    currentAge: dob ? calculateAge(dob) : config.currentAge,
  };
  console.log("[updateRetirement] ▶ payload:", payload);
  try {
    const res = await proxyCall<ApiRetirementResponse>(
      "retirement.update",
      "PUT",
      payload,
    );
    console.log(
      "[updateRetirement] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    const updated = extractRetirementConfig(res);
    console.log("[updateRetirement] ◀ extracted config:", updated);
    return updated;
  } catch (err) {
    console.error("[updateRetirement] ✗ error:", err);
    return null;
  }
}

// ── Bootstrap: fetch everything in parallel ────────────────────────────────

export interface DashboardBootstrapData {
  goals: Goal[];
  incomeRows: CashFlowRow[];
  expenseCategories: ExpenseCategory[];
  emergencyFund: ApiEmergencyFund | null;
  cashFlowHistory: CashFlowPoint[];
  holdings: AssetHolding[];
  insurancePolicies: InsurancePolicy[];
  propertyAssets: Property[];
  liabilities: Liability[];
  retirement: RetirementConfig | null;
}

export async function fetchDashboardBootstrap(): Promise<DashboardBootstrapData> {
  const [
    goals,
    incomeRows,
    expenseCategories,
    emergencyFund,
    cashFlowHistory,
    holdings,
    insurancePolicies,
    propertyAssets,
    liabilities,
    retirement,
  ] = await Promise.allSettled([
    fetchGoals(),
    fetchIncome(),
    fetchExpenses(),
    fetchEmergencyFund(),
    fetchCashFlowHistory(),
    fetchAssets(),
    fetchInsurancePolicies(),
    fetchProperties(),
    fetchLiabilities(),
    fetchRetirement(),
  ]);

  return {
    goals: goals.status === "fulfilled" ? goals.value : [],
    incomeRows: incomeRows.status === "fulfilled" ? incomeRows.value : [],
    expenseCategories:
      expenseCategories.status === "fulfilled" ? expenseCategories.value : [],
    emergencyFund:
      emergencyFund.status === "fulfilled" ? emergencyFund.value : null,
    cashFlowHistory:
      cashFlowHistory.status === "fulfilled" ? cashFlowHistory.value : [],
    holdings: holdings.status === "fulfilled" ? holdings.value : [],
    insurancePolicies:
      insurancePolicies.status === "fulfilled" ? insurancePolicies.value : [],
    propertyAssets:
      propertyAssets.status === "fulfilled" ? propertyAssets.value : [],
    liabilities: liabilities.status === "fulfilled" ? liabilities.value : [],
    retirement: retirement.status === "fulfilled" ? retirement.value : null,
  };
}

// Re-export mapper so the store can use it when seeding retirement from API
export { apiRetirementToStore };

// ── Risk Assessment ────────────────────────────────────────────────────────

export interface RiskQuestion {
  id: string; // e.g. "q1"
  question: string;
  options: Array<{
    score: number;
    label: string;
  }>;
}

export interface RiskAssessmentResult {
  assessment_id: string;
  score: number;
  band: string; // "conservative" | "moderate" | "aggressive" etc.
  risk_profile: string;
  responses: Record<string, number>;
  created_at?: string;
}

export async function fetchRiskQuestions(): Promise<RiskQuestion[]> {
  console.log("[fetchRiskQuestions] ▶ calling risk.questions");
  try {
    const res = await proxyCall<{ success?: boolean; data?: RiskQuestion[] }>(
      "risk.questions",
    );
    console.log(
      "[fetchRiskQuestions] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    const data = (res as any)?.data;
    // API shape: { data: { version, questions: [...] } }
    const questions: RiskQuestion[] = Array.isArray(data?.questions)
      ? data.questions
      : Array.isArray(data)
        ? data
        : [];
    console.log("[fetchRiskQuestions] ◀ questions count:", questions.length);
    return questions;
  } catch (err) {
    console.error("[fetchRiskQuestions] ✗ error:", err);
    return [];
  }
}

export async function submitRiskAssessment(payload: {
  questionnaire_version: string;
  responses: Record<string, number>;
}): Promise<RiskAssessmentResult | null> {
  console.log("[submitRiskAssessment] ▶ payload:", payload);
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: RiskAssessmentResult;
    }>("risk.submit", "POST", payload);
    console.log(
      "[submitRiskAssessment] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    const result = (res as any)?.data ?? null;
    console.log("[submitRiskAssessment] ◀ result:", result);
    return result;
  } catch (err) {
    console.error("[submitRiskAssessment] ✗ error:", err);
    return null;
  }
}

export async function fetchLatestRiskAssessment(): Promise<RiskAssessmentResult | null> {
  console.log("[fetchLatestRiskAssessment] ▶ calling risk.latest");
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: RiskAssessmentResult;
    }>("risk.latest");
    console.log(
      "[fetchLatestRiskAssessment] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    const result = (res as any)?.data ?? null;
    console.log("[fetchLatestRiskAssessment] ◀ result:", result);
    return result;
  } catch (err) {
    console.error("[fetchLatestRiskAssessment] ✗ error:", err);
    return null;
  }
}

// ── Risk Assessment — additional endpoints ────────────────────────────────

export async function fetchRiskAssessmentHistory(): Promise<
  RiskAssessmentResult[]
> {
  console.log("[fetchRiskAssessmentHistory] ▶ calling risk.history");
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: RiskAssessmentResult[];
    }>("risk.history");
    console.log(
      "[fetchRiskAssessmentHistory] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    const list: RiskAssessmentResult[] = Array.isArray((res as any)?.data)
      ? (res as any).data
      : Array.isArray(res)
        ? (res as unknown as RiskAssessmentResult[])
        : [];
    return list;
  } catch (err) {
    console.error("[fetchRiskAssessmentHistory] ✗ error:", err);
    return [];
  }
}

export async function fetchRiskAssessmentById(
  assessmentId: string,
): Promise<RiskAssessmentResult | null> {
  console.log(
    "[fetchRiskAssessmentById] ▶ calling risk.result for",
    assessmentId,
  );
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: RiskAssessmentResult;
    }>(`risk.result?assessment_id=${encodeURIComponent(assessmentId)}`);
    console.log(
      "[fetchRiskAssessmentById] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    return (res as any)?.data ?? null;
  } catch (err) {
    console.error("[fetchRiskAssessmentById] ✗ error:", err);
    return null;
  }
}

export async function updateRiskProfileFactors(payload: {
  [key: string]: unknown;
}): Promise<void> {
  console.log("[updateRiskProfileFactors] ▶ payload:", payload);
  try {
    await proxyCall("risk.profile-factors", "PUT", payload);
    console.log("[updateRiskProfileFactors] ◀ done");
  } catch (err) {
    console.error("[updateRiskProfileFactors] ✗ error:", err);
    throw err;
  }
}

export async function recalculateRiskScore(): Promise<RiskAssessmentResult | null> {
  console.log("[recalculateRiskScore] ▶ calling risk.recalculate");
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: RiskAssessmentResult;
    }>("risk.recalculate", "POST", {});
    console.log(
      "[recalculateRiskScore] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    return (res as any)?.data ?? null;
  } catch (err) {
    console.error("[recalculateRiskScore] ✗ error:", err);
    return null;
  }
}

// ── Subscription ──────────────────────────────────────────────────────────

export interface SubscriptionApiData {
  subscription_status: string; // "none" | "trialing" | "active"
  subscription_plan?: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  is_enterprise?: boolean;
  entitlements?: SubscriptionEntitlements;
  record_limits?: SubscriptionRecordLimits;
}

export async function fetchSubscription(): Promise<SubscriptionApiData | null> {
  console.log("[fetchSubscription] ▶ calling subscription.find");
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: SubscriptionApiData;
    }>("subscription.find");
    console.log(
      "[fetchSubscription] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    return (res as any)?.data ?? (res as unknown as SubscriptionApiData);
  } catch (err) {
    console.warn("[fetchSubscription] failed (non-fatal):", err);
    return null;
  }
}

export async function upgradeSubscription(
  plan: string,
): Promise<SubscriptionApiData | null> {
  console.log("[upgradeSubscription] ▶ payload:", { plan });
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: SubscriptionApiData;
    }>("subscription.upgrade", "POST", { plan });
    console.log(
      "[upgradeSubscription] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    return (res as any)?.data ?? null;
  } catch (err) {
    console.error("[upgradeSubscription] ✗ error:", err);
    throw err;
  }
}

// Asks the backend to create a Stripe Checkout Session and returns the URL.
// Frontend redirects to that URL — Stripe handles all card/payment UI.
// plan "trial" → 7-day free trial, card captured but not charged until trial ends
// plan "pro"   → immediate charge, no trial
export async function createCheckoutSession(
  plan: "trial" | "pro",
): Promise<{ url: string } | null> {
  console.log("[createCheckoutSession] ▶ plan:", plan);
  try {
    const res = await proxyCall<{
      success?: boolean;
      data?: { url: string };
    }>("subscription.create-checkout", "POST", { plan });
    console.log(
      "[createCheckoutSession] ◀ raw response:",
      JSON.stringify(res, null, 2),
    );
    return (res as any)?.data ?? null;
  } catch (err) {
    console.error("[createCheckoutSession] ✗ error:", err);
    throw err;
  }
}
