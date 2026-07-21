import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();
const findMany = vi.fn();
const count = vi.fn();
const findFirst = vi.fn();
const update = vi.fn();
const updateMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    inAppNotification: {
      create: (...args: unknown[]) => create(...args),
      findMany: (...args: unknown[]) => findMany(...args),
      count: (...args: unknown[]) => count(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
      update: (...args: unknown[]) => update(...args),
      updateMany: (...args: unknown[]) => updateMany(...args),
    },
  },
}));

vi.mock('@/server/notifications/web-push', () => ({
  sendWebPushToUser: vi.fn().mockResolvedValue({ sent: 0, skipped: true }),
}));

import {
  createNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.service';

describe('notification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates notification row', async () => {
    create.mockResolvedValue({
      id: 'n1',
      title: 'تست',
      body: 'بدنه',
    });
    const row = await createNotification({
      organizationId: 'org1',
      userId: 'u1',
      title: 'تست',
      body: 'بدنه',
      category: 'SYSTEM',
      skipPush: true,
    });
    expect(row.id).toBe('n1');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org1',
          userId: 'u1',
          title: 'تست',
        }),
      }),
    );
  });

  it('marks read only for matching user/org', async () => {
    findFirst.mockResolvedValue({ id: 'n1', readAt: null });
    update.mockResolvedValue({ id: 'n1', readAt: new Date() });
    const row = await markNotificationRead('org1', 'u1', 'n1');
    expect(row?.id).toBe('n1');
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'n1', organizationId: 'org1', userId: 'u1' },
    });
  });

  it('markAll updates unread only', async () => {
    updateMany.mockResolvedValue({ count: 3 });
    const countN = await markAllNotificationsRead('org1', 'u1');
    expect(countN).toBe(3);
  });
});
