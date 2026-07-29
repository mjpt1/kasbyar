import { describe, expect, it } from 'vitest';

import { parseResendInboundWebhook } from '@/server/messaging/providers/resend';

describe('parseResendInboundWebhook', () => {
  it('parses email.received event', () => {
    const emails = parseResendInboundWebhook({
      type: 'email.received',
      data: {
        email_id: 'em_123',
        from: 'Customer@Example.com',
        to: ['support@kasbyar.ir'],
        subject: 'سؤال فاکتور',
        text: 'سلام، وضعیت فاکتور چیست؟',
        created_at: '2026-07-28T08:00:00.000Z',
      },
    });

    expect(emails).toHaveLength(1);
    expect(emails[0]?.externalId).toBe('em_123');
    expect(emails[0]?.fromEmail).toBe('customer@example.com');
    expect(emails[0]?.toEmail).toBe('support@kasbyar.ir');
    expect(emails[0]?.subject).toBe('سؤال فاکتور');
    expect(emails[0]?.content).toContain('وضعیت فاکتور');
  });

  it('ignores non-inbound events', () => {
    expect(
      parseResendInboundWebhook({ type: 'email.sent', data: { from: 'a@b.com' } }),
    ).toEqual([]);
  });

  it('falls back to html when text is missing', () => {
    const emails = parseResendInboundWebhook({
      type: 'email.received',
      data: {
        from: 'a@example.com',
        to: ['b@example.com'],
        html: '<p>متن <strong>HTML</strong></p>',
      },
    });

    expect(emails[0]?.content).toContain('متن HTML');
  });
});
