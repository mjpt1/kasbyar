/**
 * Provider selection from environment — single factory pattern.
 * @see docs/integrations/provider-selection-policy.md
 */

export function resolveProviderId(
  explicit: string | null | undefined,
  envValue: string | undefined,
  defaultId: string,
  allowed: readonly string[],
): string {
  const candidate = (explicit ?? envValue ?? defaultId).trim().toLowerCase();
  if (allowed.includes(candidate)) {
    return candidate;
  }
  return defaultId;
}

export interface ProviderEnvKeys {
  /** e.g. BILLING_PROVIDER */
  provider: string;
  /** e.g. BILLING_ZARINPAL_MERCHANT_ID — documented per adapter */
  secretsPrefix: string;
}

export const PROVIDER_ENV_KEYS = {
  billing: { provider: 'BILLING_PROVIDER', secretsPrefix: 'BILLING_' },
  storage: { provider: 'STORAGE_PROVIDER', secretsPrefix: 'STORAGE_' },
  sms: { provider: 'SMS_PROVIDER', secretsPrefix: 'SMS_' },
  email: { provider: 'EMAIL_PROVIDER', secretsPrefix: 'EMAIL_' },
  notification: { provider: 'NOTIFICATION_PROVIDER', secretsPrefix: 'NOTIFICATION_' },
  analytics: { provider: 'ANALYTICS_PROVIDER', secretsPrefix: 'ANALYTICS_' },
} as const satisfies Record<string, ProviderEnvKeys>;
