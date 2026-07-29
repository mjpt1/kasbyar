import { describe, expect, it } from 'vitest';

import { parseTelegramWebhook } from '@/server/messaging/providers/telegram-bot';

describe('parseTelegramWebhook', () => {
  it('extracts inbound text messages', () => {
    const messages = parseTelegramWebhook({
      update_id: 100,
      message: {
        message_id: 42,
        date: 1700000000,
        text: 'سلام از تلگرام',
        chat: { id: 123456789, type: 'private' },
        from: { first_name: 'علی', last_name: 'رضایی', username: 'ali_r' },
      },
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe('سلام از تلگرام');
    expect(messages[0]?.chatId).toBe('123456789');
    expect(messages[0]?.senderName).toBe('علی رضایی');
  });

  it('returns empty for non-text updates', () => {
    expect(parseTelegramWebhook({ update_id: 1 })).toEqual([]);
  });
});
