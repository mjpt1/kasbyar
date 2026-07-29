import { PROVIDER_IDS } from '@kesbyar/shared';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';

export type ResendCredentials = {
  apiKey: string;
  fromEmail: string;
};

export type ResendSendResult =
  | { status: 'sent'; externalId: string }
  | { status: 'failed'; error: string };

export type ResendInboundEmail = {
  externalId: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  content: string;
  sentAt: Date;
};

export async function sendResendEmail(
  creds: ResendCredentials,
  params: { to: string; subject: string; body: string },
): Promise<ResendSendResult> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${creds.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: creds.fromEmail,
      to: [params.to],
      subject: params.subject.slice(0, 998),
      text: params.body.slice(0, 100_000),
    }),
  });

  const data = (await res.json()) as { id?: string; message?: string };

  if (!res.ok) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      provider: PROVIDER_IDS.EMAIL_RESEND,
      status: res.status,
      message: data.message,
    });
    return { status: 'failed', error: data.message ?? 'ارسال ایمیل ناموفق بود' };
  }

  if (!data.id) {
    return { status: 'failed', error: 'شناسه ایمیل Resend دریافت نشد' };
  }

  return { status: 'sent', externalId: data.id };
}

export function parseResendInboundWebhook(body: unknown): ResendInboundEmail[] {
  if (!body || typeof body !== 'object') return [];

  const payload = body as {
    type?: string;
    data?: {
      email_id?: string;
      from?: string;
      to?: string[];
      subject?: string;
      text?: string;
      html?: string;
      created_at?: string;
    };
  };

  if (payload.type !== 'email.received' || !payload.data) return [];

  const data = payload.data;
  const fromEmail = data.from?.trim();
  const toEmail = data.to?.[0]?.trim();
  const content = data.text?.trim() || stripHtml(data.html ?? '') || '';
  if (!fromEmail || !toEmail || !content) return [];

  return [
    {
      externalId: data.email_id ?? `resend-${Date.now()}`,
      fromEmail: fromEmail.toLowerCase(),
      toEmail: toEmail.toLowerCase(),
      subject: data.subject?.trim() ?? '(بدون موضوع)',
      content,
      sentAt: data.created_at ? new Date(data.created_at) : new Date(),
    },
  ];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
