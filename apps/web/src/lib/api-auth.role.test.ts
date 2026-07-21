import { describe, expect, it } from 'vitest';

import { requireApiRole } from '@/lib/api-auth';
import type { SessionContext } from '@kesbyar/shared';

function mockSession(role: SessionContext['role']): SessionContext {
  return {
    user: { id: 'u1', email: 'a@b.com', name: 'Test' },
    organizationId: 'org-1',
    organizationName: 'Org',
    role,
    workspaceId: 'org-1',
    industryPack: 'GENERAL',
    industrySpecialty: null,
    platformRole: 'USER',
    isSuperAdmin: false,
  };
}

describe('requireApiRole STAFF gate', () => {
  it('denies VIEWER for STAFF-only routes', () => {
    const denied = requireApiRole(mockSession('VIEWER'), 'STAFF');
    expect(denied).not.toBeNull();
    expect(denied?.status).toBe(403);
  });

  it('allows STAFF and above', () => {
    expect(requireApiRole(mockSession('STAFF'), 'STAFF')).toBeNull();
    expect(requireApiRole(mockSession('MANAGER'), 'STAFF')).toBeNull();
    expect(requireApiRole(mockSession('ADMIN'), 'STAFF')).toBeNull();
  });

  it('denies STAFF for ADMIN-only platform mutations', () => {
    const denied = requireApiRole(mockSession('STAFF'), 'ADMIN');
    expect(denied).not.toBeNull();
    expect(denied?.status).toBe(403);
  });
});
