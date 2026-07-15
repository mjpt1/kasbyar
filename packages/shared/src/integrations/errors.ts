/**
 * Normalized integration failures — vendor-agnostic surface for product + ops.
 * @see docs/integrations/failure-normalization-guidelines.md
 */

export const INTEGRATION_FAILURE_CODES = {
  PROVIDER_UNAVAILABLE: 'provider_unavailable',
  PROVIDER_TIMEOUT: 'provider_timeout',
  PROVIDER_REJECTED: 'provider_rejected',
  PROVIDER_AUTH: 'provider_auth',
  PROVIDER_RATE_LIMITED: 'provider_rate_limited',
  INVALID_RECIPIENT: 'invalid_recipient',
  INVALID_PAYLOAD: 'invalid_payload',
  NOT_CONFIGURED: 'not_configured',
  UNKNOWN: 'unknown',
} as const;

export type IntegrationFailureCode =
  (typeof INTEGRATION_FAILURE_CODES)[keyof typeof INTEGRATION_FAILURE_CODES];

export interface IntegrationFailure {
  code: IntegrationFailureCode;
  /** Persian-safe message for product layer (optional override in service) */
  message: string;
  provider?: string;
  category?: string;
  retryable: boolean;
  /** Vendor-specific code — logs only, never API response */
  vendorCode?: string;
}

export function integrationFailure(
  code: IntegrationFailureCode,
  message: string,
  options?: Partial<Pick<IntegrationFailure, 'provider' | 'category' | 'retryable' | 'vendorCode'>>,
): IntegrationFailure {
  return {
    code,
    message,
    provider: options?.provider,
    category: options?.category,
    retryable: options?.retryable ?? isRetryableCode(code),
    vendorCode: options?.vendorCode,
  };
}

export function isRetryableCode(code: IntegrationFailureCode): boolean {
  return (
    code === INTEGRATION_FAILURE_CODES.PROVIDER_UNAVAILABLE ||
    code === INTEGRATION_FAILURE_CODES.PROVIDER_TIMEOUT ||
    code === INTEGRATION_FAILURE_CODES.PROVIDER_RATE_LIMITED
  );
}

/** Map unknown thrown errors at adapter boundary */
export function normalizeIntegrationError(
  error: unknown,
  context: { provider: string; category?: string; fallbackMessage?: string },
): IntegrationFailure {
  if (isIntegrationFailure(error)) {
    return error;
  }

  const message =
    error instanceof Error
      ? error.message
      : context.fallbackMessage ?? 'خطا در ارتباط با سرویس خارجی';

  const name = error instanceof Error ? error.name : '';
  if (name === 'AbortError' || message.toLowerCase().includes('timeout')) {
    return integrationFailure(INTEGRATION_FAILURE_CODES.PROVIDER_TIMEOUT, 'زمان پاسخ سرویس به پایان رسید', {
      provider: context.provider,
      category: context.category,
    });
  }

  return integrationFailure(INTEGRATION_FAILURE_CODES.UNKNOWN, message, {
    provider: context.provider,
    category: context.category,
  });
}

export function isIntegrationFailure(value: unknown): value is IntegrationFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'retryable' in value
  );
}
