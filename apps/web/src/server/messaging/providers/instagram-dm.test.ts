import { describe, expect, it } from 'vitest';

import { parseInstagramWebhook } from '@/server/messaging/providers/instagram-dm';

describe('parseInstagramWebhook', () => {
  it('parses Instagram messaging webhook', () => {
    const body = {
      object: 'instagram',
      entry: [
        {
          id: 'page-123',
          messaging: [
            {
              sender: { id: 'user-456' },
              recipient: { id: 'page-123' },
              timestamp: 1700000000000,
              message: { mid: 'mid.abc', text: 'سلام' },
            },
          ],
        },
      ],
    };

    const result = parseInstagramWebhook(body);
    expect(result).toHaveLength(1);
    expect(result[0]?.externalId).toBe('ig-mid.abc');
    expect(result[0]?.senderId).toBe('user-456');
    expect(result[0]?.content).toBe('سلام');
  });

  it('returns empty for non-instagram object', () => {
    expect(parseInstagramWebhook({ object: 'page' })).toEqual([]);
  });
});
