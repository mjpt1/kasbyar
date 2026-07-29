import type { InboxChannel } from '@kesbyar/shared';
import type { MessageChannel } from '@prisma/client';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { listInboxThreads } from '@/server/messaging/inbox.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const INBOX_CHANNELS: InboxChannel[] = [
  'WHATSAPP',
  'SMS',
  'EMAIL',
  'PHONE',
  'TELEGRAM',
  'INSTAGRAM',
];

const POLL_MS = 8_000;
const HEARTBEAT_MS = 15_000;

/**
 * Production-oriented SSE for inbox.
 * Vercel serverless has no durable WebSocket fan-out; we keep an authenticated
 * EventSource that polls Postgres on an interval and emits diffs + heartbeats.
 * Clients should reconnect with exponential backoff (see InboxThreadList).
 */
export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { searchParams } = new URL(request.url);
  const channelParam = searchParams.get('channel');
  const channel =
    channelParam && INBOX_CHANNELS.includes(channelParam as InboxChannel)
      ? (channelParam as MessageChannel)
      : undefined;

  const orgId = session.organizationId;
  const encoder = new TextEncoder();
  let lastFingerprint = '';
  let lastHeartbeatAt = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, payload: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));
      };

      // Advise clients on reconnect delay (ms)
      controller.enqueue(encoder.encode(`retry: 3000\n\n`));
      send('ready', { at: new Date().toISOString(), pollMs: POLL_MS });

      const poll = async () => {
        try {
          const data = await listInboxThreads(orgId, { pageSize: 50, channel });
          const fingerprint = data.items
            .map((t) => `${t.id}:${t.lastMessageAt}:${t.unreadCount}`)
            .join('|');
          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            send('threads', { type: 'threads', data });
            lastHeartbeatAt = Date.now();
          } else if (Date.now() - lastHeartbeatAt >= HEARTBEAT_MS) {
            send('heartbeat', { type: 'heartbeat', at: new Date().toISOString() });
            lastHeartbeatAt = Date.now();
          }
        } catch {
          send('error', { type: 'error', message: 'poll_failed' });
        }
      };

      await poll();
      const interval = setInterval(() => void poll(), POLL_MS);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
