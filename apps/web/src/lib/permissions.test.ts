import { describe, expect, it } from 'vitest';

import {
  canManageBilling,
  canManageMembers,
  canManageSettings,
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
