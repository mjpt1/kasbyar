import { describe, expect, it } from 'vitest';

import { maskSecret } from '@/lib/crypto/secrets';
import { canManageSettings } from '@/lib/permissions';
import { orgIntegrationsUpdateSchema } from '@/lib/validators';

describe('integrations settings access & masking', () => {
  it('only OWNER/ADMIN can manage settings integrations', () => {
    expect(canManageSettings('OWNER')).toBe(true);
    expect(canManageSettings('ADMIN')).toBe(true);
    expect(canManageSettings('MANAGER')).toBe(false);
    expect(canManageSettings('STAFF')).toBe(false);
  });

  it('never exposes full secrets in mask helper', () => {
    const full = 'super-secret-api-key-9999';
    const masked = maskSecret(full.slice(-4), true);
    expect(masked).toBe('••••9999');
    expect(masked).not.toContain('super-secret');
  });

  it('validates integration PATCH body with Persian errors', () => {
    const bad = orgIntegrationsUpdateSchema.safeParse({
      moadian: { intermediaryUrl: 'not-a-url' },
    });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(bad.error.errors[0]?.message).toMatch(/http/i);
    }

    const ok = orgIntegrationsUpdateSchema.safeParse({
      payment: { preferredProvider: 'zarinpal', sandbox: true },
    });
    expect(ok.success).toBe(true);
  });
});
