import { describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '@/lib/errors';
import { requireCustomerInOrg } from '@/server/tenant/tenant-scope';

describe('tenant-scope', () => {
  it('throws NotFound when customer not in org', async () => {
    const db = {
      customer: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(
      requireCustomerInOrg('org-a', 'cust-1', db as never),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('resolves when customer belongs to org', async () => {
    const db = {
      customer: {
        findFirst: vi.fn().mockResolvedValue({ id: 'cust-1' }),
      },
    };

    await expect(
      requireCustomerInOrg('org-a', 'cust-1', db as never),
    ).resolves.toEqual({ id: 'cust-1' });
    expect(db.customer.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: 'org-a', id: 'cust-1' }),
      }),
    );
  });
});
