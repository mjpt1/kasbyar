import { prisma } from '@/lib/prisma';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';

export interface WebPushPayload {
  title: string;
  body: string;
  href?: string;
  tag?: string;
}

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim() || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:ops@kesbyar.ir';
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function isWebPushConfigured(): boolean {
  return getVapidConfig() != null;
}

export function getVapidPublicKey(): string | null {
  return getVapidConfig()?.publicKey ?? null;
}

export async function sendWebPushToUser(userId: string, payload: WebPushPayload) {
  const vapid = getVapidConfig();
  if (!vapid) {
    return { sent: 0, skipped: true as const };
  }

  let webpush: typeof import('web-push');
  try {
    webpush = await import('web-push');
  } catch {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_NOT_CONFIGURED, {
      message: 'web-push package unavailable',
    });
    return { sent: 0, skipped: true as const };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { sent: 0, skipped: false as const };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    href: payload.href ?? '/dashboard',
    tag: payload.tag,
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body,
      );
      sent += 1;
    } catch (error) {
      const statusCode =
        error && typeof error === 'object' && 'statusCode' in error
          ? Number((error as { statusCode: number }).statusCode)
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
      } else {
        logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
          message: error instanceof Error ? error.message : String(error),
          userId,
          endpoint: sub.endpoint.slice(0, 48),
        });
      }
    }
  }

  return { sent, skipped: false as const };
}
