import { describe, expect, it } from 'vitest';

import { sanitizeLogRecord, safeActorRef, safeOrganizationRef } from './sanitize';

describe('observability sanitize', () => {
  it('redacts sensitive keys', () => {
    const out = sanitizeLogRecord({ password: 'x', token: 'y', ok: true });
    expect(out.password).toBe('[redacted]');
    expect(out.token).toBe('[redacted]');
    expect(out.ok).toBe(true);
  });

  it('truncates long strings', () => {
    const out = sanitizeLogRecord({ body: 'x'.repeat(600) }) as { body: string };
    expect(out.body.length).toBeLessThan(600);
    expect(out.body.endsWith('…')).toBe(true);
  });

  it('safe refs use ids only', () => {
    expect(safeOrganizationRef('org-1')).toEqual({ organizationId: 'org-1' });
    expect(safeActorRef('user-1')).toEqual({ userId: 'user-1' });
  });
});
