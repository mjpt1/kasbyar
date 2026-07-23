import Constants from 'expo-constants';

/** Production API — override with EXPO_PUBLIC_API_URL for local dev. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'https://kasbyar.vercel.app';

export const APP_NAME = 'کسب‌یار';
export const APP_TAGLINE = 'سیستم‌عامل هوشمند کسب‌وکار';

export const MOBILE_HEADERS = {
  client: 'x-kasbyar-client',
  clientValue: 'mobile',
  orgId: 'x-org-id',
} as const;

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export const STORAGE_KEYS = {
  token: 'kesbyar_token',
  orgId: 'kesbyar_org_id',
  expiresAt: 'kesbyar_expires_at',
} as const;
