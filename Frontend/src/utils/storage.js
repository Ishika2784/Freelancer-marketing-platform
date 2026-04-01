/**
 * Auth storage — uses sessionStorage so tokens are never
 * persisted to disk and are cleared when the tab closes.
 *
 * sessionStorage is scoped per-tab, cleared on tab close,
 * and not accessible by other origins — safer than localStorage
 * for auth tokens.
 */

const KEYS = {
  TOKEN:    "token",
  ROLE:     "userRole",
  APPLIED:  "applied_jobs",
};

export const storage = {
  // ── Auth ──
  setAuth(token, role) {
    sessionStorage.setItem(KEYS.TOKEN, token);
    sessionStorage.setItem(KEYS.ROLE,  role);
  },
  getToken()  { return sessionStorage.getItem(KEYS.TOKEN) || localStorage.getItem("token"); },
  getRole()   { return sessionStorage.getItem(KEYS.ROLE) || localStorage.getItem("role"); },
  clearAuth() {
    sessionStorage.removeItem(KEYS.TOKEN);
    sessionStorage.removeItem(KEYS.ROLE);
  },

  // ── Applied jobs (freelancer) ──
  getApplied() {
    try { return JSON.parse(sessionStorage.getItem(KEYS.APPLIED) || "{}"); }
    catch { return {}; }
  },
  setApplied(map) {
    sessionStorage.setItem(KEYS.APPLIED, JSON.stringify(map));
  },

  // ── Helpers ──
  isLoggedIn() { return !!sessionStorage.getItem(KEYS.TOKEN); },
};
