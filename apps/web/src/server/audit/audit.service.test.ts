import { describe, expect, it, vi } from 'vitest';

import { AUDIT_ACTIONS } from '@kesbyar/shared';

import { sanitizeAuditMetadata } from '@/server/audit/audit.service';

describe('sanitizeAuditMetadata', () => {
  it('redacts sensitive keys', () => {
    const out = sanitizeAuditMetadata({
      password: 'secret123',
      token: 'abc',
      note: 'ok',
    }) as Record<string, unknown>;
    expect(out.password).toBe('[redacted]');
    expect(out.token).toBe('[redacted]');
    expect(out.note).toBe('ok');
  });

  it('truncates long strings', () => {
    const out = sanitizeAuditMetadata({ body: 'x'.repeat(600) }) as Record<string, unknown>;
    expect(String(out.body).length).toBeLessThan(600);
  });
});

describe('audit action constants', () => {
  it('defines payment and settings actions', () => {
    expect(AUDIT_ACTIONS.PAYMENT_CREATE).toBe('payment.create');
    expect(AUDIT_ACTIONS.SETTINGS_UPDATE).toBe('settings.update');
  });
});
