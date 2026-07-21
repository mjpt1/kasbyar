import { describe, expect, it } from 'vitest';

import { needsOnboarding } from '@/server/onboarding/onboarding.service';

describe('needsOnboarding', () => {
  it('requires OWNER/ADMIN when specialty missing', () => {
    expect(needsOnboarding('OWNER', null)).toBe(true);
    expect(needsOnboarding('ADMIN', '')).toBe(true);
    expect(needsOnboarding('ADMIN', '   ')).toBe(true);
  });

  it('skips when specialty already set (e.g. by super-admin)', () => {
    expect(needsOnboarding('OWNER', 'clinic-general')).toBe(false);
    expect(needsOnboarding('ADMIN', 'retail-grocery')).toBe(false);
  });

  it('never gates STAFF/VIEWER/MANAGER', () => {
    expect(needsOnboarding('STAFF', null)).toBe(false);
    expect(needsOnboarding('VIEWER', null)).toBe(false);
    expect(needsOnboarding('MANAGER', null)).toBe(false);
  });
});
