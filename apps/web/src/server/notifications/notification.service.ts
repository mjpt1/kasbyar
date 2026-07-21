import { prisma } from '@/lib/prisma';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';

import { sendWebPushToUser } from './web-push';

export type NotificationCategory =
  | 'TASK'
  | 'INVOICE'
  | 'LEAD'
  | 'AUTOMATION'
  | 'SYSTEM'
  | 'BRIEFING';

export interface CreateNotificationInput {
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  href?: string | null;
  category?: NotificationCategory | string;
  /** Skip push (e.g. bulk); still writes DB row */
  skipPush?: boolean;
}

export async function createNotification(input: CreateNotificationInput) {
  const row = await prisma.inAppNotification.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      category: input.category ?? 'SYSTEM',
    },
  });

  if (!input.skipPush) {
    void sendWebPushToUser(input.userId, {
      title: input.title,
      body: input.body,
      href: input.href ?? '/dashboard',
      tag: row.id,
    }).catch((error) => {
      logger.warn(APP_LOG_EVENTS.NOTIFICATION_QUEUED, {
        message: error instanceof Error ? error.message : String(error),
        userId: input.userId,
        notificationId: row.id,
      });
    });
  }

  return row;
}

export async function listNotifications(
  organizationId: string,
  userId: string,
  options?: { unreadOnly?: boolean; take?: number },
) {
  return prisma.inAppNotification.findMany({
    where: {
      organizationId,
      userId,
      ...(options?.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.take ?? 40,
  });
}

export async function unreadCount(organizationId: string, userId: string) {
  return prisma.inAppNotification.count({
    where: { organizationId, userId, readAt: null },
  });
}

export async function markNotificationRead(
  organizationId: string,
  userId: string,
  notificationId: string,
) {
  const existing = await prisma.inAppNotification.findFirst({
    where: { id: notificationId, organizationId, userId },
  });
  if (!existing) return null;
  if (existing.readAt) return existing;
  return prisma.inAppNotification.update({
    where: { id: existing.id },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(organizationId: string, userId: string) {
  const result = await prisma.inAppNotification.updateMany({
    where: { organizationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}

/** Notify all OWNER/ADMIN members of an org (dedupe by title+day when provided). */
export async function notifyOrgAdmins(
  organizationId: string,
  input: Omit<CreateNotificationInput, 'organizationId' | 'userId'> & {
    dedupeKey?: string;
  },
) {
  const members = await prisma.membership.findMany({
    where: {
      organizationId,
      isActive: true,
      role: { in: ['OWNER', 'ADMIN'] },
    },
    select: { userId: true },
  });

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  for (const m of members) {
    if (input.dedupeKey) {
      const existing = await prisma.inAppNotification.findFirst({
        where: {
          organizationId,
          userId: m.userId,
          title: input.title,
          createdAt: { gte: dayStart },
        },
        select: { id: true },
      });
      if (existing) continue;
    }

    await createNotification({
      organizationId,
      userId: m.userId,
      title: input.title,
      body: input.body,
      href: input.href,
      category: input.category,
      skipPush: input.skipPush,
    });
  }
}

export async function savePushSubscription(input: {
  userId: string;
  organizationId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      userId: input.userId,
      organizationId: input.organizationId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
    update: {
      userId: input.userId,
      organizationId: input.organizationId,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function removePushSubscription(endpoint: string, userId: string) {
  return prisma.pushSubscription.deleteMany({
    where: { endpoint, userId },
  });
}
