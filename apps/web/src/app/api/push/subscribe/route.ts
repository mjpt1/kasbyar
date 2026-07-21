import { z } from 'zod';

import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import {
  removePushSubscription,
  savePushSubscription,
} from '@/server/notifications/notification.service';
import { getVapidPublicKey, isWebPushConfigured } from '@/server/notifications/web-push';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    return jsonResponse(
      apiSuccess({
        configured: isWebPushConfigured(),
        publicKey: getVapidPublicKey(),
      }),
    );
  } catch (error) {
    return handleApiError(error, 'push.vapid.GET');
  }
}

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    if (!isWebPushConfigured()) {
      return errorResponse('اعلان مرورگر پیکربندی نشده است', 503);
    }

    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
    }

    const row = await savePushSubscription({
      userId: session.user.id,
      organizationId: session.organizationId,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent: request.headers.get('user-agent'),
    });

    return jsonResponse(apiSuccess({ id: row.id }), 201);
  } catch (error) {
    return handleApiError(error, 'push.subscribe.POST');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : '';
    if (!endpoint) return errorResponse('endpoint الزامی است', 400);

    await removePushSubscription(endpoint, session.user.id);
    return jsonResponse(apiSuccess({ ok: true }));
  } catch (error) {
    return handleApiError(error, 'push.subscribe.DELETE');
  }
}
