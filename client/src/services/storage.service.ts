// Centralized storage abstraction for auth tokens.
//
// Design decisions:
// - Access token  → sessionStorage: survives page refresh within the same tab,
//   cleared automatically when the tab is closed (reduces XSS persistence window).
// - Refresh token → localStorage: persists across browser sessions so users
//   don't need to log in every time they open a new tab.
//
// Neither token is ever stored in React state because state is lost on refresh.

const ACCESS_TOKEN_KEY = 'lms_access_token';
const REFRESH_TOKEN_KEY = 'lms_refresh_token';

export const storageService = {
  // ── Access Token ──────────────────────────────────────────────────────────

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeAccessToken(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // ── Refresh Token ─────────────────────────────────────────────────────────

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // ── Session ───────────────────────────────────────────────────────────────

  clearAll(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
