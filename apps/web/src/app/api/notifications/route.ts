import { z } from 'zod';

import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadCount,
} from '@/server/notifications/notification.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === '1';
    const [items, unread] = await Promise.all([
      listNotifications(session.organizationId, session.user.id, {
        unreadOnly,
        take: 40,
      }),
      unreadCount(session.organizationId, session.user.id),
    ]);

    return jsonResponse(apiSuccess({ items, unread }));
  } catch (error) {
    return handleApiError(error, 'notifications.GET');
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  read: z.literal(true),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
    }

    const row = await markNotificationRead(
      session.organizationId,
      session.user.id,
      parsed.data.id,
    );
    if (!row) return errorResponse('اعلان یافت نشد', 404);
    return jsonResponse(apiSuccess(row));
  } catch (error) {
    return handleApiError(error, 'notifications.PATCH');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json().catch(() => ({}));
    if (body?.action === 'read-all') {
      const count = await markAllNotificationsRead(
        session.organizationId,
        session.user.id,
      );
      return jsonResponse(apiSuccess({ count }));
    }

    return errorResponse('عملیات نامعتبر', 400);
  } catch (error) {
    return handleApiError(error, 'notifications.POST');
  }
}
