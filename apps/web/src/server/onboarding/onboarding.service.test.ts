import { describe, expect, it } from 'vitest';

import { needsOnboarding } from '@/server/onboarding/onboarding.service';

describe('needsOnboarding', () => {
  it('requires OWNER/ADMIN on GENERAL pack when specialty missing', () => {
    expect(needsOnboarding('OWNER', 'GENERAL', null)).toBe(true);
    expect(needsOnboarding('ADMIN', 'GENERAL', '')).toBe(true);
    expect(needsOnboarding('ADMIN', 'GENERAL', '   ')).toBe(true);
  });

  it('skips vertical packs without specialty — pack dashboards are enough', () => {
    expect(needsOnboarding('OWNER', 'RETAIL', null)).toBe(false);
    expect(needsOnboarding('ADMIN', 'CLINIC', null)).toBe(false);
  });

  it('skips when specialty already set (e.g. by super-admin)', () => {
    expect(needsOnboarding('OWNER', 'GENERAL', 'freelancer')).toBe(false);
    expect(needsOnboarding('ADMIN', 'RETAIL', 'clothing-store')).toBe(false);
  });

  it('never gates STAFF/VIEWER/MANAGER', () => {
    expect(needsOnboarding('STAFF', 'GENERAL', null)).toBe(false);
    expect(needsOnboarding('VIEWER', 'GENERAL', null)).toBe(false);
    expect(needsOnboarding('MANAGER', 'GENERAL', null)).toBe(false);
  });
});
