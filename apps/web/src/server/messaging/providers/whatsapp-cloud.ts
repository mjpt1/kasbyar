import { PROVIDER_IDS } from '@kesbyar/shared';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';

export type WhatsAppCredentials = {
  phoneNumberId: string;
  accessToken: string;
};

export type WhatsAppSendResult =
  | { status: 'sent'; externalId: string }
  | { status: 'failed'; error: string };

export type WhatsAppInboundMessage = {
  externalId: string;
  fromPhone: string;
  content: string;
  sentAt: Date;
  phoneNumberId: string;
};

const GRAPH_API = 'https://graph.facebook.com/v21.0';

export async function sendWhatsAppText(
  creds: WhatsAppCredentials,
  toPhone: string,
  body: string,
): Promise<WhatsAppSendResult> {
  const res = await fetch(`${GRAPH_API}/${creds.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone,
      type: 'text',
      text: { body: body.slice(0, 4096) },
    }),
  });

  const data = (await res.json()) as {
    messages?: { id?: string }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      provider: PROVIDER_IDS.WHATSAPP_CLOUD,
      status: res.status,
      message: data.error?.message,
    });
    return {
      status: 'failed',
      error: data.error?.message ?? 'ارسال واتساپ ناموفق بود',
    };
  }

  const externalId = data.messages?.[0]?.id;
  if (!externalId) {
    return { status: 'failed', error: 'شناسه پیام واتساپ دریافت نشد' };
  }

  return { status: 'sent', externalId };
}

export function parseWhatsAppWebhook(body: unknown): WhatsAppInboundMessage[] {
  if (!body || typeof body !== 'object') return [];

  const payload = body as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          metadata?: { phone_number_id?: string };
          messages?: Array<{
            id?: string;
            from?: string;
            timestamp?: string;
            type?: string;
            text?: { body?: string };
          }>;
        };
      }>;
    }>;
  };

  const results: WhatsAppInboundMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      if (!phoneNumberId) continue;

      for (const message of value?.messages ?? []) {
        if (message.type !== 'text' || !message.text?.body || !message.from || !message.id) {
          continue;
        }
        const ts = message.timestamp ? Number(message.timestamp) * 1000 : Date.now();
        results.push({
          externalId: message.id,
          fromPhone: message.from,
          content: message.text.body,
          sentAt: new Date(ts),
          phoneNumberId,
        });
      }
    }
  }

  return results;
}
