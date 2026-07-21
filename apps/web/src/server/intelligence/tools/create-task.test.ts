import { describe, expect, it, vi, beforeEach } from 'vitest';

import { NotFoundError } from '@/lib/errors';

const { mockCreate, mockRequireCustomer, mockRequireLead } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockRequireCustomer: vi.fn(),
  mockRequireLead: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: { create: mockCreate },
  },
}));

vi.mock('@/server/audit/audit.service', () => ({
  logAudit: vi.fn(),
}));

vi.mock('@/server/platform/platform.service', () => ({
  recordAgentFeedback: vi.fn(),
}));

vi.mock('@/server/tenant/tenant-scope', () => ({
  requireCustomerInOrg: mockRequireCustomer,
  requireLeadInOrg: mockRequireLead,
}));

import { createTaskFromAgent } from '@/server/intelligence/tools/create-task';

describe('createTaskFromAgent tenant checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'task-1' });
  });

  it('rejects cross-tenant customerId before create', async () => {
    mockRequireCustomer.mockRejectedValue(new NotFoundError('مشتری در این فضای کاری یافت نشد'));

    await expect(
      createTaskFromAgent({
        organizationId: 'org-a',
        userId: 'user-1',
        title: 'Test task',
        customerId: 'cust-other-org',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockRequireCustomer).toHaveBeenCalledWith('org-a', 'cust-other-org');
  });

  it('rejects cross-tenant leadId before create', async () => {
    mockRequireLead.mockRejectedValue(new NotFoundError('لید در این فضای کاری یافت نشد'));

    await expect(
      createTaskFromAgent({
        organizationId: 'org-a',
        userId: 'user-1',
        title: 'Test task',
        leadId: 'lead-other-org',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockRequireLead).toHaveBeenCalledWith('org-a', 'lead-other-org');
  });

  it('creates task when foreign keys belong to org', async () => {
    mockRequireCustomer.mockResolvedValue({ id: 'cust-1' });
    mockRequireLead.mockResolvedValue({ id: 'lead-1' });

    const result = await createTaskFromAgent({
      organizationId: 'org-a',
      userId: 'user-1',
      title: 'Valid task',
      customerId: 'cust-1',
      leadId: 'lead-1',
    });

    expect(result.taskId).toBe('task-1');
    expect(mockCreate).toHaveBeenCalled();
  });
});
