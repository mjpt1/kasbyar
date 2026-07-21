import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockCreate, mockRequireCustomer } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockRequireCustomer: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    customerSentiment: { create: mockCreate },
  },
}));

vi.mock('@/lib/ai', () => ({
  chatWithLlm: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/server/tenant/tenant-scope', () => ({
  requireCustomerInOrg: mockRequireCustomer,
}));

import { NotFoundError } from '@/lib/errors';
import { analyzeCustomerSentiment } from '@/server/sentiment/sentiment.service';

describe('analyzeCustomerSentiment tenant checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 'sent-1' });
    mockRequireCustomer.mockResolvedValue({ id: 'cust-1' });
  });

  it('validates customer belongs to org before persisting', async () => {
    await analyzeCustomerSentiment('org-a', 'cust-1', 'ممنون از خدمات عالی');

    expect(mockRequireCustomer).toHaveBeenCalledWith('org-a', 'cust-1');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('does not create sentiment for cross-tenant customer', async () => {
    mockRequireCustomer.mockRejectedValue(new NotFoundError());

    await expect(
      analyzeCustomerSentiment('org-a', 'cust-other', 'متن ناراضی'),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(mockCreate).not.toHaveBeenCalled();
  });
});
