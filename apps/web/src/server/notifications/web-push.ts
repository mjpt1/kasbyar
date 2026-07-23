import { prisma } from '@/lib/prisma';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';

export interface WebPushPayload {
  title: string;
  body: string;
  href?: string;
  tag?: string;
}

const EXPO_PREFIX = 'expo:';

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

export function isExpoPushEndpoint(endpoint: string): boolean {
  return endpoint.startsWith(EXPO_PREFIX);
}

export function expoEndpointFromToken(token: string): string {
  return `${EXPO_PREFIX}${token}`;
}

export function expoTokenFromEndpoint(endpoint: string): string {
  return endpoint.slice(EXPO_PREFIX.length);
}

async function sendExpoPush(
  tokens: string[],
  payload: WebPushPayload,
): Promise<number> {
  if (tokens.length === 0) return 0;

  const messages = tokens.map((to) => ({
    to,
    sound: 'default' as const,
    title: payload.title,
    body: payload.body,
    data: {
      href: payload.href ?? '/dashboard',
      tag: payload.tag,
    },
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      message: `Expo push HTTP ${response.status}`,
    });
    return 0;
  }

  return tokens.length;
}

export async function sendWebPushToUser(userId: string, payload: WebPushPayload) {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { sent: 0, skipped: false as const };

  const expoSubs = subs.filter((s) => isExpoPushEndpoint(s.endpoint));
  const webSubs = subs.filter((s) => !isExpoPushEndpoint(s.endpoint));

  let sent = 0;

  if (expoSubs.length > 0) {
    try {
      sent += await sendExpoPush(
        expoSubs.map((s) => expoTokenFromEndpoint(s.endpoint)),
        payload,
      );
    } catch (error) {
      logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
        message: error instanceof Error ? error.message : String(error),
        userId,
        provider: 'expo',
      });
    }
  }

  if (webSubs.length === 0) {
    return { sent, skipped: false as const };
  }

  const vapid = getVapidConfig();
  if (!vapid) {
    return { sent, skipped: true as const };
  }

  let webpush: typeof import('web-push');
  try {
    webpush = await import('web-push');
  } catch {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_NOT_CONFIGURED, {
      message: 'web-push package unavailable',
    });
    return { sent, skipped: true as const };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    href: payload.href ?? '/dashboard',
    tag: payload.tag,
  });

  for (const sub of webSubs) {
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
