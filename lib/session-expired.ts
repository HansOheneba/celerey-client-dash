/** Fired when the API returns 401 after a failed token refresh. */
export const SESSION_EXPIRED_EVENT = "celerey:session-expired";

let notified = false;

/** Show the session-expired modal once per page load. */
export function notifySessionExpired(): void {
  if (typeof window === "undefined" || notified) return;
  notified = true;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}
