import { PROVIDER_IDS } from '@kesbyar/shared';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';

export type TelegramCredentials = {
  botToken: string;
};

export type TelegramSendResult =
  | { status: 'sent'; externalId: string }
  | { status: 'failed'; error: string };

export type TelegramInboundMessage = {
  externalId: string;
  chatId: string;
  content: string;
  sentAt: Date;
  senderName: string | null;
};

const TELEGRAM_API = 'https://api.telegram.org';

export async function sendTelegramText(
  creds: TelegramCredentials,
  chatId: string,
  body: string,
): Promise<TelegramSendResult> {
  const res = await fetch(`${TELEGRAM_API}/bot${creds.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: body.slice(0, 4096),
    }),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    result?: { message_id?: number };
    description?: string;
  };

  if (!res.ok || !data.ok) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      provider: PROVIDER_IDS.TELEGRAM_BOT,
      status: res.status,
      message: data.description,
    });
    return {
      status: 'failed',
      error: data.description ?? 'ارسال تلگرام ناموفق بود',
    };
  }

  const messageId = data.result?.message_id;
  if (messageId == null) {
    return { status: 'failed', error: 'شناسه پیام تلگرام دریافت نشد' };
  }

  return { status: 'sent', externalId: String(messageId) };
}

export function parseTelegramWebhook(body: unknown): TelegramInboundMessage[] {
  if (!body || typeof body !== 'object') return [];

  const update = body as {
    update_id?: number;
    message?: {
      message_id?: number;
      date?: number;
      text?: string;
      chat?: { id?: number; type?: string };
      from?: { first_name?: string; last_name?: string; username?: string };
    };
  };

  const message = update.message;
  if (!message?.text || message.chat?.id == null || message.message_id == null) {
    return [];
  }

  const nameParts = [message.from?.first_name, message.from?.last_name].filter(Boolean);
  const senderName =
    nameParts.length > 0
      ? nameParts.join(' ')
      : message.from?.username
        ? `@${message.from.username}`
        : null;

  const ts = message.date ? message.date * 1000 : Date.now();

  return [
    {
      externalId: `tg-${update.update_id ?? message.message_id}`,
      chatId: String(message.chat.id),
      content: message.text,
      sentAt: new Date(ts),
      senderName,
    },
  ];
}
