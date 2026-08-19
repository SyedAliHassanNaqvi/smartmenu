/**
 * Global application constants shared across the codebase.
 */
export const APP_NAME = "SmartMenu";
export const DEFAULT_LOCALE = "en";
export const DEFAULT_CURRENCY = "EUR";
export const DEFAULT_TIMEZONE = "Europe/Rome";
export const DEFAULT_TAX_RATE = 0.22;

/**
 * Name of the httpOnly auth cookie used by the server (proxy + API routes).
 * Client-side auth state lives in zustand's persisted store.
 */
export const AUTH_COOKIE_NAME = "smartmenu_token";

/**
 * How long an admin session stays valid before the user must re-authenticate.
 */
export const AUTH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days
