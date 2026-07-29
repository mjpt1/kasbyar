/** Edge-safe auth constants (no Node.js crypto/bcrypt imports). */

export const SESSION_COOKIE = 'kesbyar_session';
export const ORG_COOKIE = 'kesbyar_org';
/** Customer portal session (stores portal access token after claim / magic-link). */
export const PORTAL_COOKIE = 'kesbyar_portal';
export const SESSION_DAYS = 30;
export const PORTAL_SESSION_DAYS = 14;

/** Native app sends Bearer token + optional active org header. */
export const AUTH_BEARER_PREFIX = 'Bearer ';
export const MOBILE_CLIENT_HEADER = 'x-kasbyar-client';
export const MOBILE_CLIENT_VALUE = 'mobile';
export const ORG_ID_HEADER = 'x-org-id';
