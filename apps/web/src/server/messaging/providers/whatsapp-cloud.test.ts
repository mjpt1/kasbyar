import { describe, expect, it } from 'vitest';

import { parseWhatsAppWebhook } from '@/server/messaging/providers/whatsapp-cloud';

describe('parseWhatsAppWebhook', () => {
  it('extracts inbound text messages', () => {
    const messages = parseWhatsAppWebhook({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: '12345' },
                messages: [
                  {
                    id: 'wamid.abc',
                    from: '989121111111',
                    timestamp: '1700000000',
                    type: 'text',
                    text: { body: 'سلام' },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe('سلام');
    expect(messages[0]?.phoneNumberId).toBe('12345');
  });
});
