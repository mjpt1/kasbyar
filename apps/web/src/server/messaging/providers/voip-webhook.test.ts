import { describe, expect, it } from 'vitest';

import {
  formatCallSummary,
  parseVoipWebhook,
} from '@/server/messaging/providers/voip-webhook';

describe('parseVoipWebhook', () => {
  it('parses a completed inbound call', () => {
    const events = parseVoipWebhook({
      callId: 'c-100',
      direction: 'inbound',
      status: 'completed',
      from: '09121234567',
      to: '02112345678',
      duration: 125,
    });

    expect(events).toHaveLength(1);
    expect(events[0]?.externalId).toBe('c-100');
    expect(events[0]?.fromPhone).toBe('989121234567');
    expect(events[0]?.durationSeconds).toBe(125);
  });

  it('parses events array format', () => {
    const events = parseVoipWebhook({
      events: [
        {
          id: 'x-1',
          type: 'outgoing',
          callStatus: 'missed',
          caller: '989131111111',
          callee: '989121234567',
        },
      ],
    });

    expect(events).toHaveLength(1);
    expect(events[0]?.direction).toBe('outbound');
    expect(events[0]?.status).toBe('missed');
  });

  it('ignores ringing-only events', () => {
    expect(
      parseVoipWebhook({ callId: 'r-1', status: 'ringing', from: '09121111111' }),
    ).toEqual([]);
  });
});

describe('formatCallSummary', () => {
  it('formats Persian summary', () => {
    const summary = formatCallSummary({
      externalId: '1',
      direction: 'inbound',
      status: 'completed',
      fromPhone: '989121234567',
      toPhone: '982112345678',
      durationSeconds: 180,
      agentExtension: null,
      recordingUrl: null,
      sentAt: new Date(),
    });

    expect(summary).toContain('ورودی');
    expect(summary).toContain('پاسخ داده شد');
  });
});
