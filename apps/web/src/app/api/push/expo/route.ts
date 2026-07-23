import { z } from 'zod';

import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import {
  removePushSubscription,
  savePushSubscription,
} from '@/server/notifications/notification.service';
import { expoEndpointFromToken } from '@/server/notifications/web-push';

const expoSchema = z.object({
  token: z.string().min(10, 'توکن Expo الزامی است'),
  platform: z.enum(['android', 'ios', 'web']).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = expoSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
    }

    const endpoint = expoEndpointFromToken(parsed.data.token);
    const row = await savePushSubscription({
      userId: session.user.id,
      organizationId: session.organizationId,
      endpoint,
      p256dh: 'expo',
      auth: 'expo',
      userAgent: `expo-mobile/${parsed.data.platform ?? 'unknown'}`,
    });

    return jsonResponse(apiSuccess({ id: row.id, endpoint }), 201);
  } catch (error) {
    return handleApiError(error, 'push.expo.POST');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    if (!token) return errorResponse('token الزامی است', 400);

    await removePushSubscription(expoEndpointFromToken(token), session.user.id);
    return jsonResponse(apiSuccess({ ok: true }));
  } catch (error) {
    return handleApiError(error, 'push.expo.DELETE');
  }
}
