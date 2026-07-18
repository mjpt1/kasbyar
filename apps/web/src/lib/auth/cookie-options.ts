/** Edge-safe cookie option helpers (no Node-only imports). */

import { SESSION_DAYS, ORG_COOKIE, SESSION_COOKIE } from './constants';

export function useSecureCookies(): boolean {
  if (process.env.VERCEL === '1') return true;
  const appEnv = process.env.APP_ENV;
  if (appEnv === 'production' || appEnv === 'staging') return true;
  return process.env.NODE_ENV === 'production';
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: useSecureCookies(),
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function sessionCookieOptions(expires: Date) {
  const maxAge = Math.max(
    60,
    Math.floor((expires.getTime() - Date.now()) / 1000),
  );
  return {
    ...baseCookieOptions(),
    maxAge,
    expires,
  };
}

export function orgCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: 60 * 60 * 24 * 365,
  };
}

/** Must mirror attributes used when setting, or browsers keep the Secure cookie. */
export function clearedAuthCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  };
}

export function clearAuthCookiesOnResponse(response: {
  cookies: { set: (name: string, value: string, options: object) => void };
}) {
  // Clear both Secure and non-Secure variants (legacy misconfigured deploys).
  for (const secure of [true, false]) {
    const options = clearedAuthCookieOptions(secure);
    response.cookies.set(SESSION_COOKIE, '', options);
    response.cookies.set(ORG_COOKIE, '', options);
  }
}

export function applyAuthCookies(
  response: {
    cookies: { set: (name: string, value: string, options: object) => void };
  },
  token: string,
  expiresAt: Date,
  organizationId?: string | null,
) {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  if (organizationId) {
    response.cookies.set(ORG_COOKIE, organizationId, orgCookieOptions());
  }
}

export { SESSION_COOKIE, ORG_COOKIE, SESSION_DAYS };
