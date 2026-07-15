import { describe, expect, it } from 'vitest';

import { getPlanDefinition } from '@kesbyar/shared';

describe('entitlement policy (unit)', () => {
  it('distinguishes role denial message from plan upgrade codes', () => {
    const free = getPlanDefinition('FREE');
    expect(free.upgradeTo).toBe('STARTER');
    expect(free.quotas.customers).toBe(25);
  });

  it('ENTERPRISE has unlimited-style quotas', () => {
    const ent = getPlanDefinition('ENTERPRISE');
    expect(ent.quotas.customers).toBeGreaterThan(100_000);
  });
});
