import { describe, expect, it } from 'vitest';

import { parseKavenegarInboundWebhook } from '@/server/messaging/providers/kavenegar-inbound';

describe('parseKavenegarInboundWebhook', () => {
  it('parses single inbound SMS object', () => {
    const messages = parseKavenegarInboundWebhook({
      message: 'سلام',
      sender: '09121234567',
      messageid: '12345',
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe('سلام');
    expect(messages[0]?.fromPhone).toBe('989121234567');
    expect(messages[0]?.externalId).toBe('12345');
  });

  it('parses entries array format', () => {
    const messages = parseKavenegarInboundWebhook({
      entries: [
        { text: 'پاسخ مشتری', from: '989131111111', id: 'abc' },
      ],
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.fromPhone).toBe('989131111111');
  });

  it('returns empty for invalid payload', () => {
    expect(parseKavenegarInboundWebhook(null)).toEqual([]);
    expect(parseKavenegarInboundWebhook({})).toEqual([]);
  });
});
