import { createHmac, timingSafeEqual } from 'node:crypto';

import { PROVIDER_IDS } from '@kesbyar/shared';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';

export type InstagramCredentials = {
  pageId: string;
  accessToken: string;
};

export type InstagramSendResult =
  | { status: 'sent'; externalId: string }
  | { status: 'failed'; error: string };

export type InstagramTokenValidation =
  | { valid: true; pageName: string | null }
  | { valid: false; error: string };

export type InstagramInboundMessage = {
  externalId: string;
  senderId: string;
  content: string;
  sentAt: Date;
  senderName: string | null;
};

/** Meta permissions required for production Instagram DM (App Review). */
export const INSTAGRAM_META_PERMISSIONS = [
  'instagram_manage_messages',
  'instagram_basic',
  'pages_messaging',
  'pages_show_list',
  'pages_read_engagement',
] as const;

const GRAPH_API = 'https://graph.facebook.com/v21.0';

type MetaMessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
  };
  read?: { mid?: string; watermark?: number };
  delivery?: { mids?: string[]; watermark?: number };
};

/**
 * Parses Meta Instagram messaging webhook payloads.
 * Skips read receipts, delivery confirmations, and echo (outbound) messages.
 * Full Meta App Review is required for instagram_manage_messages in production.
 */
export function parseInstagramWebhook(body: unknown): InstagramInboundMessage[] {
  if (!body || typeof body !== 'object') return [];

  const payload = body as {
    object?: string;
    entry?: Array<{
      id?: string;
      messaging?: MetaMessagingEvent[];
    }>;
  };

  if (payload.object !== 'instagram') return [];

  const messages: InstagramInboundMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      if (event.read || event.delivery) continue;
      if (event.message?.is_echo) continue;

      const text = event.message?.text?.trim();
      const senderId = event.sender?.id;
      const mid = event.message?.mid;
      if (!text || !senderId || !mid) continue;

      messages.push({
        externalId: `ig-${mid}`,
        senderId,
        content: text,
        sentAt: new Date(event.timestamp ?? Date.now()),
        senderName: null,
      });
    }
  }

  return messages;
}

/**
 * Verifies X-Hub-Signature-256 from Meta webhooks.
 * Returns true when appSecret is unset (dev mode) or signature matches.
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string | null,
): boolean {
  if (!appSecret?.trim()) return true;
  if (!signatureHeader?.startsWith('sha256=')) return false;

  const expected = createHmac('sha256', appSecret.trim())
    .update(rawBody, 'utf8')
    .digest('hex');
  const received = signatureHeader.slice('sha256='.length);

  if (expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function validateInstagramToken(
  creds: InstagramCredentials,
): Promise<InstagramTokenValidation> {
  const res = await fetch(
    `${GRAPH_API}/${creds.pageId}?fields=id,name&access_token=${encodeURIComponent(creds.accessToken)}`,
  );
  const data = (await res.json()) as { id?: string; name?: string; error?: { message?: string } };

  if (!res.ok || data.error) {
    return {
      valid: false,
      error: data.error?.message ?? 'توکن یا شناسه صفحه نامعتبر است',
    };
  }

  return { valid: true, pageName: data.name ?? null };
}

export async function sendInstagramText(
  creds: InstagramCredentials,
  recipientId: string,
  body: string,
): Promise<InstagramSendResult> {
  const res = await fetch(`${GRAPH_API}/${creds.pageId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${creds.accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: body.slice(0, 1000) },
    }),
  });

  const data = (await res.json()) as {
    message_id?: string;
    error?: { message?: string };
  };

  if (!res.ok || data.error) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      provider: PROVIDER_IDS.INSTAGRAM_DM,
      status: res.status,
      message: data.error?.message,
    });
    return {
      status: 'failed',
      error: data.error?.message ?? 'ارسال اینستاگرام ناموفق بود',
    };
  }

  if (!data.message_id) {
    return { status: 'failed', error: 'شناسه پیام اینستاگرام دریافت نشد' };
  }

  return { status: 'sent', externalId: data.message_id };
}
