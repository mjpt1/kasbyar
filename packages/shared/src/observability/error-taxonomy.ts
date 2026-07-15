/**
 * Error classification for logs, API responses, and support triage.
 * API `code` field should align with these where applicable.
 */
export const ERROR_CATEGORIES = {
  AUTH: 'auth',
  AUTHORIZATION: 'authorization',
  TENANT: 'tenant',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  PLAN_GATING: 'plan_gating',
  RATE_LIMIT: 'rate_limit',
  EXTERNAL_AI: 'external_ai',
  EXTERNAL_DB: 'external_db',
  EXTERNAL_INTEGRATION: 'external_integration',
  INTERNAL: 'internal',
} as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[keyof typeof ERROR_CATEGORIES];

/** Map common AppError codes to support categories */
export const API_ERROR_CATEGORY: Record<string, ErrorCategory> = {
  UNAUTHORIZED: ERROR_CATEGORIES.AUTH,
  FORBIDDEN: ERROR_CATEGORIES.AUTHORIZATION,
  NOT_FOUND: ERROR_CATEGORIES.NOT_FOUND,
  VALIDATION_ERROR: ERROR_CATEGORIES.VALIDATION,
  PLAN_UPGRADE_REQUIRED: ERROR_CATEGORIES.PLAN_GATING,
  INTERNAL_ERROR: ERROR_CATEGORIES.INTERNAL,
};
