import { describe, expect, it } from 'vitest';

import { canAccessSpecialtyDashboard } from './specialty-access';

describe('canAccessSpecialtyDashboard', () => {
  it('allows only the org’s chosen specialty', () => {
    expect(canAccessSpecialtyDashboard('freelancer', 'freelancer')).toBe(true);
    expect(canAccessSpecialtyDashboard('freelancer', 'software-house')).toBe(false);
  });

  it('denies when specialty is unset', () => {
    expect(canAccessSpecialtyDashboard(null, 'freelancer')).toBe(false);
    expect(canAccessSpecialtyDashboard('', 'freelancer')).toBe(false);
    expect(canAccessSpecialtyDashboard('   ', 'freelancer')).toBe(false);
  });
});
