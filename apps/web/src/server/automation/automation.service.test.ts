import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mockListRules, mockTaskFindFirst, mockTaskCreate, mockReminderCreate } = vi.hoisted(() => ({
  mockListRules: vi.fn(),
  mockTaskFindFirst: vi.fn(),
  mockTaskCreate: vi.fn(),
  mockReminderCreate: vi.fn(),
}));

vi.mock('@/server/reports/reports.service', () => ({
  listAutomationRules: mockListRules,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findFirst: mockTaskFindFirst,
      create: mockTaskCreate,
    },
    reminder: { create: mockReminderCreate },
    notification: { create: vi.fn() },
    invoice: { update: vi.fn() },
    lead: { update: vi.fn() },
    customer: { findMany: vi.fn() },
    message: { findMany: vi.fn() },
    customerSentiment: { findMany: vi.fn() },
    activityLog: { findMany: vi.fn() },
  },
}));

vi.mock('@/server/audit/audit.service', () => ({
  logActivity: vi.fn(),
}));

vi.mock('@/server/leads/lead.service', () => ({
  getStaleLeads: vi.fn().mockResolvedValue([]),
}));

import { runEventAutomation } from '@/server/automation/automation.service';

describe('runEventAutomation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskFindFirst.mockResolvedValue(null);
    mockTaskCreate.mockResolvedValue({ id: 'task-1' });
    mockReminderCreate.mockResolvedValue({ id: 'rem-1' });
  });

  it('runs matching active rules for INBOUND_MESSAGE', async () => {
    mockListRules.mockResolvedValue([
      {
        id: 'rule-1',
        name: 'پاسخ سریع',
        description: 'پیام ورودی',
        trigger: 'INBOUND_MESSAGE',
        action: 'CREATE_TASK',
        isActive: true,
      },
      {
        id: 'rule-2',
        name: 'غیرفعال',
        trigger: 'INBOUND_MESSAGE',
        action: 'CREATE_TASK',
        isActive: false,
      },
    ]);

    const affected = await runEventAutomation('org-1', 'INBOUND_MESSAGE', {
      title: 'پاسخ به پیام علی',
      description: 'سلام، قیمت چقدر است؟',
      customerId: 'cust-1',
    });

    expect(affected).toBe(1);
    expect(mockTaskCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org-1',
          title: 'پاسخ به پیام علی',
          customerId: 'cust-1',
        }),
      }),
    );
  });

  it('skips duplicate tasks within 24h', async () => {
    mockListRules.mockResolvedValue([
      {
        id: 'rule-1',
        name: 'پیگیری تماس',
        trigger: 'MISSED_CALL',
        action: 'CREATE_TASK',
        isActive: true,
      },
    ]);
    mockTaskFindFirst.mockResolvedValue({ id: 'existing-task' });

    const affected = await runEventAutomation('org-1', 'MISSED_CALL', {
      title: 'تماس ورودی از دست‌رفته',
      customerId: 'cust-2',
    });

    expect(affected).toBe(0);
    expect(mockTaskCreate).not.toHaveBeenCalled();
  });

  it('runs NOTIFY_USER for NEGATIVE_SENTIMENT', async () => {
    mockListRules.mockResolvedValue([
      {
        id: 'rule-3',
        name: 'هشدار نارضایتی',
        trigger: 'NEGATIVE_SENTIMENT',
        action: 'NOTIFY_USER',
        isActive: true,
      },
    ]);

    const affected = await runEventAutomation('org-1', 'NEGATIVE_SENTIMENT', {
      title: 'پیگیری مشتری ناراضی: رضا',
      description: 'خدمات ضعیف بود',
      customerId: 'cust-3',
    });

    expect(affected).toBe(1);
    expect(mockReminderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org-1',
          title: 'پیگیری مشتری ناراضی: رضا',
        }),
      }),
    );
  });
});
