/** Keys that must never appear in plaintext in logs or audit metadata */
export const SENSITIVE_LOG_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'secret',
  'authorization',
  'cookie',
  'session',
  'sessionsecret',
  'ai_service_token',
  'apikey',
  'api_key',
  'credentials',
  'creditcard',
  'cardnumber',
  'cvv',
  'nationalid',
  'ssn',
]);

const MAX_STRING_LENGTH = 500;

export type SafeLogRecord = Record<string, unknown>;

/**
 * Redact secrets and truncate large strings for structured logs.
 * Shared by web logger and audit metadata sanitization patterns.
 */
export function sanitizeLogRecord(
  record?: Record<string, unknown>,
): SafeLogRecord {
  if (!record) return {};
  const out: SafeLogRecord = {};
  for (const [key, value] of Object.entries(record)) {
    if (SENSITIVE_LOG_KEYS.has(key.toLowerCase())) {
      out[key] = '[redacted]';
      continue;
    }
    if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
      out[key] = `${value.slice(0, MAX_STRING_LENGTH)}…`;
      continue;
    }
    out[key] = value;
  }
  return out;
}

/** Safe workspace id for logs — UUID only, no slug PII */
export function safeOrganizationRef(organizationId: string): {
  organizationId: string;
} {
  return { organizationId };
}

/** Safe actor ref — prefer internal user id over email in logs */
export function safeActorRef(userId: string): { userId: string } {
  return { userId };
}
