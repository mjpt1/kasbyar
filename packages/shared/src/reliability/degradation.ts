/**
 * External dependencies and degradation levels — KesbYar reliability model.
 * @see docs/reliability/failure-mode-catalog.md
 */

export const DEPENDENCIES = {
  DATABASE: 'database',
  AI_SERVICE: 'ai_service',
  FILE_STORAGE: 'file_storage',
  BILLING_PROVIDER: 'billing_provider',
  SMS_PROVIDER: 'sms_provider',
  EMAIL_PROVIDER: 'email_provider',
  ANALYTICS: 'analytics',
  PAYMENT_GATEWAY: 'payment_gateway',
} as const;

export type DependencyId = (typeof DEPENDENCIES)[keyof typeof DEPENDENCIES];

/** User-visible service health coarse states */
export type DegradationLevel = 'healthy' | 'degraded' | 'unavailable';

/**
 * How the app responds when a dependency fails.
 * - fallback: alternate path (e.g. local AI summary)
 * - block: action cannot complete — show Persian error
 * - queue: defer for retry (future jobs)
 * - ignore: non-critical path continues (e.g. metrics)
 */
export type FailurePolicy = 'fallback' | 'block' | 'queue' | 'ignore';

export interface DependencyFailurePolicy {
  dependency: DependencyId;
  policy: FailurePolicy;
  /** Core CRM/invoicing must keep working if true */
  coreAppContinues: boolean;
}

/** Default policies aligned with V1 implementation */
export const DEFAULT_FAILURE_POLICIES: Record<DependencyId, DependencyFailurePolicy> = {
  [DEPENDENCIES.DATABASE]: {
    dependency: DEPENDENCIES.DATABASE,
    policy: 'block',
    coreAppContinues: false,
  },
  [DEPENDENCIES.AI_SERVICE]: {
    dependency: DEPENDENCIES.AI_SERVICE,
    policy: 'fallback',
    coreAppContinues: true,
  },
  [DEPENDENCIES.FILE_STORAGE]: {
    dependency: DEPENDENCIES.FILE_STORAGE,
    policy: 'block',
    coreAppContinues: true,
  },
  [DEPENDENCIES.BILLING_PROVIDER]: {
    dependency: DEPENDENCIES.BILLING_PROVIDER,
    policy: 'block',
    coreAppContinues: true,
  },
  [DEPENDENCIES.SMS_PROVIDER]: {
    dependency: DEPENDENCIES.SMS_PROVIDER,
    policy: 'queue',
    coreAppContinues: true,
  },
  [DEPENDENCIES.EMAIL_PROVIDER]: {
    dependency: DEPENDENCIES.EMAIL_PROVIDER,
    policy: 'queue',
    coreAppContinues: true,
  },
  [DEPENDENCIES.ANALYTICS]: {
    dependency: DEPENDENCIES.ANALYTICS,
    policy: 'ignore',
    coreAppContinues: true,
  },
  [DEPENDENCIES.PAYMENT_GATEWAY]: {
    dependency: DEPENDENCIES.PAYMENT_GATEWAY,
    policy: 'block',
    coreAppContinues: true,
  },
};
