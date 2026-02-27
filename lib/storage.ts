export type SubscriptionStatus = "none" | "trialing" | "active";

export type AuthState = {
  loggedIn: boolean;
  email: string | null;
};

export type SubState = {
  status: SubscriptionStatus;
  trialStartedAt: string | null;
};

const AUTH_EMAIL_KEY = "auth_email";
const AUTH_LOGGED_IN_KEY = "auth_logged_in";
const SUB_STATUS_KEY = "sub_status";
const TRIAL_STARTED_AT_KEY = "trial_started_at";

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // noop
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // noop
  }
}

export function getAuth(): AuthState {
  const email = safeGetItem(AUTH_EMAIL_KEY);
  const loggedInRaw = safeGetItem(AUTH_LOGGED_IN_KEY);
  return {
    loggedIn: loggedInRaw === "true",
    email: email ?? null,
  };
}

export function setAuth(email: string): void {
  safeSetItem(AUTH_EMAIL_KEY, email);
  safeSetItem(AUTH_LOGGED_IN_KEY, "true");
}

export function clearAuth(): void {
  safeRemoveItem(AUTH_EMAIL_KEY);
  safeSetItem(AUTH_LOGGED_IN_KEY, "false");
}

export function getSubscription(): SubState {
  const statusRaw = safeGetItem(SUB_STATUS_KEY) ?? "none";
  const trialStartedAt = safeGetItem(TRIAL_STARTED_AT_KEY);
  const status =
    statusRaw === "trialing" || statusRaw === "active"
      ? (statusRaw as SubscriptionStatus)
      : "none";
  return {
    status,
    trialStartedAt: trialStartedAt ?? null,
  };
}

export function setSubscription(status: SubscriptionStatus): void {
  safeSetItem(SUB_STATUS_KEY, status);
  if (status !== "trialing") {
    safeRemoveItem(TRIAL_STARTED_AT_KEY);
  }
}

export function setTrialStartedAt(iso: string): void {
  safeSetItem(TRIAL_STARTED_AT_KEY, iso);
}

export function clearSubscription(): void {
  safeSetItem(SUB_STATUS_KEY, "none");
  safeRemoveItem(TRIAL_STARTED_AT_KEY);
}

// --- Net worth history storage helpers ----------------
const NETWORTH_HISTORY_KEY = "networth_history_v1";

export type NetWorthHistoryItem = {
  ts: string; // ISO timestamp
  netWorth: number;
  breakdown?: unknown;
  // Optional computed fields for quick lookup
  percentChange?: number | null; // percent vs previous (positive => up)
  trend?: "up" | "down" | "flat";
  previousNetWorth?: number | null;
};

export function getNetWorthHistory(): NetWorthHistoryItem[] {
  const raw = safeGetItem(NETWORTH_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as NetWorthHistoryItem[];
    return [];
  } catch {
    return [];
  }
}

export function pushNetWorthSnapshot(
  item: NetWorthHistoryItem,
  maxEntries = 500,
) {
  const list = getNetWorthHistory();
  list.push(item);
  // keep newest last; cap size
  const start = Math.max(0, list.length - maxEntries);
  const trimmed = list.slice(start);
  try {
    safeSetItem(NETWORTH_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // noop
  }
}
