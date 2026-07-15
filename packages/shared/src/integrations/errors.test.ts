import { describe, expect, it } from 'vitest';

import {
  INTEGRATION_FAILURE_CODES,
  integrationFailure,
  isRetryableCode,
  normalizeIntegrationError,
} from './errors';

describe('integration errors', () => {
  it('marks timeout-like errors as retryable', () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    const failure = normalizeIntegrationError(err, {
      provider: 'kavenegar',
      category: 'sms',
    });
    expect(failure.code).toBe(INTEGRATION_FAILURE_CODES.PROVIDER_TIMEOUT);
    expect(failure.retryable).toBe(true);
  });

  it('integrationFailure sets retryable from code', () => {
    expect(
      isRetryableCode(integrationFailure(INTEGRATION_FAILURE_CODES.PROVIDER_RATE_LIMITED, 'x').code),
    ).toBe(true);
    expect(
      isRetryableCode(integrationFailure(INTEGRATION_FAILURE_CODES.PROVIDER_AUTH, 'x').code),
    ).toBe(false);
  });
});
