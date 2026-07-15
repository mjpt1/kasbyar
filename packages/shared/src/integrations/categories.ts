/**
 * Integration provider categories — KesbYar external boundaries.
 * @see docs/integrations/integration-boundary-rules.md
 */

export const INTEGRATION_CATEGORIES = {
  AI: 'ai',
  BILLING: 'billing',
  STORAGE: 'storage',
  SMS: 'sms',
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  ANALYTICS: 'analytics',
  ERP: 'erp',
} as const;

export type IntegrationCategory =
  (typeof INTEGRATION_CATEGORIES)[keyof typeof INTEGRATION_CATEGORIES];

/** Stable provider identifiers — never vendor API codes */
export const PROVIDER_IDS = {
  // Billing
  BILLING_MANUAL: 'manual',
  BILLING_ZARINPAL: 'zarinpal',
  BILLING_IDPAY: 'idpay',
  // Storage
  STORAGE_LOCAL: 'local',
  STORAGE_S3: 's3',
  // Notifications
  NOTIFICATION_NOOP: 'noop',
  SMS_KAVENEGAR: 'kavenegar',
  EMAIL_RESEND: 'resend',
  // Analytics
  ANALYTICS_LOG: 'log',
  ANALYTICS_POSTHOG: 'posthog',
  // AI
  AI_INTERNAL: 'internal-fastapi',
} as const;

export type ProviderId = (typeof PROVIDER_IDS)[keyof typeof PROVIDER_IDS];

export interface ProviderDescriptor {
  id: ProviderId | string;
  category: IntegrationCategory;
  /** Human label for ops — not shown to end users */
  label: string;
}
