import { describe, expect, it } from 'vitest';

import {
  canManageBilling,
  canManageMembers,
  canManageSettings,
  canAccessPath,
  getMinRoleForPath,
  hasMinRole,
} from './permissions';

describe('hasMinRole', () => {
  it('OWNER satisfies MANAGER requirement', () => {
    expect(hasMinRole('OWNER', 'MANAGER')).toBe(true);
  });

  it('STAFF does not satisfy MANAGER requirement', () => {
    expect(hasMinRole('STAFF', 'MANAGER')).toBe(false);
  });

  it('MANAGER satisfies STAFF requirement', () => {
    expect(hasMinRole('MANAGER', 'STAFF')).toBe(true);
  });
});

describe('capability helpers', () => {
  it('only ADMIN+ can manage members', () => {
    expect(canManageMembers('ADMIN')).toBe(true);
    expect(canManageMembers('MANAGER')).toBe(false);
  });

  it('MANAGER+ can manage billing', () => {
    expect(canManageBilling('MANAGER')).toBe(true);
    expect(canManageBilling('STAFF')).toBe(false);
  });

  it('ADMIN+ can manage settings', () => {
    expect(canManageSettings('OWNER')).toBe(true);
    expect(canManageSettings('STAFF')).toBe(false);
  });
});

describe('route access', () => {
  it('STAFF can access AI, automation, and help routes', () => {
    for (const path of [
      '/command',
      '/conversation',
      '/memory',
      '/forecast',
      '/strategy',
      '/simulation',
      '/meetings',
      '/growth',
      '/twin',
      '/platform',
      '/automation',
      '/help',
    ]) {
      expect(canAccessPath('STAFF', path)).toBe(true);
      expect(getMinRoleForPath(path)).toBe('STAFF');
    }
  });

  it('ADMIN+ can access onboarding; STAFF cannot', () => {
    expect(getMinRoleForPath('/onboarding')).toBe('ADMIN');
    expect(canAccessPath('ADMIN', '/onboarding')).toBe(true);
    expect(canAccessPath('OWNER', '/onboarding')).toBe(true);
    expect(canAccessPath('STAFF', '/onboarding')).toBe(false);
  });

  it('OWNER can access all AI routes', () => {
    expect(canAccessPath('OWNER', '/platform')).toBe(true);
    expect(canAccessPath('OWNER', '/forecast')).toBe(true);
  });

  it('MANAGER can access reports', () => {
    expect(canAccessPath('MANAGER', '/reports')).toBe(true);
  });

  it('VIEWER can access dashboard only at viewer level', () => {
    expect(canAccessPath('VIEWER', '/dashboard')).toBe(true);
    expect(canAccessPath('VIEWER', '/customers')).toBe(false);
  });
});
