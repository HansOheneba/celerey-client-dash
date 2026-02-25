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
