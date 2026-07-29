'use client';

import type { InboxChannel, InboxThreadSummary } from '@kesbyar/shared';
import { INBOX_CHANNEL_LABELS } from '@kesbyar/shared';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { InboxThreadPanel } from '@/components/features/inbox/inbox-thread-panel';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MemberOption = {
  userId: string;
  name: string;
};

type InboxThreadListProps = {
  canAssign?: boolean;
};

const CHANNEL_FILTERS: Array<{ value: InboxChannel | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'همه' },
  { value: 'WHATSAPP', label: INBOX_CHANNEL_LABELS.WHATSAPP },
  { value: 'SMS', label: INBOX_CHANNEL_LABELS.SMS },
  { value: 'EMAIL', label: INBOX_CHANNEL_LABELS.EMAIL },
  { value: 'PHONE', label: INBOX_CHANNEL_LABELS.PHONE },
  { value: 'TELEGRAM', label: INBOX_CHANNEL_LABELS.TELEGRAM },
  { value: 'INSTAGRAM', label: INBOX_CHANNEL_LABELS.INSTAGRAM },
];

const POLL_INTERVAL_MS = 15_000;

function channelPanelType(
  channel: InboxChannel,
): 'whatsapp' | 'sms' | 'email' | 'phone' | 'telegram' | 'instagram' {
  switch (channel) {
    case 'SMS':
      return 'sms';
    case 'EMAIL':
      return 'email';
    case 'PHONE':
      return 'phone';
    case 'TELEGRAM':
      return 'telegram';
    case 'INSTAGRAM':
      return 'instagram';
    default:
      return 'whatsapp';
  }
}

export function InboxThreadList({ canAssign = false }: InboxThreadListProps) {
  const [items, setItems] = useState<InboxThreadSummary[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<InboxChannel | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (channelFilter !== 'ALL') params.set('channel', channelFilter);
      const res = await fetch(`/api/inbox?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items ?? []);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [channelFilter]);

  useEffect(() => {
    void load();
    setSelectedId(null);
  }, [load]);

  useEffect(() => {
    if (typeof EventSource === 'undefined') {
      const timer = window.setInterval(() => {
        void load(true);
      }, POLL_INTERVAL_MS);
      return () => window.clearInterval(timer);
    }

    const params = new URLSearchParams();
    if (channelFilter !== 'ALL') params.set('channel', channelFilter);
    const streamUrl = `/api/inbox/stream?${params.toString()}`;

    let cancelled = false;
    let es: EventSource | null = null;
    let pollTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let attempt = 0;

    const applyThreads = (payload: {
      type?: string;
      data?: { items?: InboxThreadSummary[] };
    }) => {
      if (payload.type === 'threads' && payload.data?.items) {
        setItems(payload.data.items);
        setLoading(false);
      }
    };

    const stopPollFallback = () => {
      if (pollTimer) {
        window.clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const startPollFallback = () => {
      if (pollTimer || cancelled) return;
      pollTimer = window.setInterval(() => {
        void load(true);
      }, POLL_INTERVAL_MS);
    };

    const connect = () => {
      if (cancelled) return;
      es?.close();
      es = new EventSource(streamUrl);

      const onPayload = (event: MessageEvent) => {
        attempt = 0;
        stopPollFallback();
        try {
          applyThreads(JSON.parse(event.data) as {
            type?: string;
            data?: { items?: InboxThreadSummary[] };
          });
        } catch {
          // ignore malformed SSE payloads
        }
      };

      es.addEventListener('threads', onPayload);
      es.onmessage = onPayload;

      es.onerror = () => {
        es?.close();
        es = null;
        startPollFallback();
        if (cancelled) return;
        const delay = Math.min(30_000, 1_500 * 2 ** attempt);
        attempt += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      es?.close();
      stopPollFallback();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
    };
  }, [channelFilter, load]);

  useEffect(() => {
    if (!canAssign) return;
    async function loadMembers() {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success) {
        setMembers(
          (data.data ?? []).map((m: { user: { id: string; name: string } }) => ({
            userId: m.user.id,
            name: m.user.name,
          })),
        );
      }
    }
    void loadMembers();
  }, [canAssign]);

  async function handleAssign(threadId: string, assigneeId: string | null) {
    setAssigningId(threadId);
    try {
      const res = await fetch(`/api/inbox/${threadId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: assigneeId || null }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'تخصیص ناموفق بود');
        return;
      }
      setItems((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                assigneeId: data.data.assigneeId,
                assigneeName: data.data.assigneeName,
              }
            : t,
        ),
      );
      toast.success('مسئول مکالمه به‌روز شد');
    } catch {
      toast.error('خطا در تخصیص');
    } finally {
      setAssigningId(null);
    }
  }

  const selected = items.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">مکالمات اخیر</CardTitle>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={channelFilter === filter.value ? 'default' : 'outline'}
                className={cn('h-8 text-xs')}
                onClick={() => setChannelFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">در حال بارگذاری...</p>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              هنوز مکالمه‌ای ثبت نشده. webhook کانال‌ها را در تنظیمات یکپارچه‌سازی پیکربندی کنید.
            </p>
          ) : (
            items.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  'flex gap-3 p-4 transition-colors',
                  selectedId === thread.id ? 'bg-primary/5' : 'hover:bg-muted/40',
                )}
              >
                <button
                  type="button"
                  className="flex-1 space-y-1 text-right"
                  onClick={() => setSelectedId(thread.id)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {INBOX_CHANNEL_LABELS[thread.channel] ?? thread.channel}
                    </Badge>
                    {thread.unreadCount > 0 ? (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                        {thread.unreadCount}
                      </Badge>
                    ) : null}
                    <span className="font-medium">
                      {thread.customerName ??
                        thread.leadTitle ??
                        thread.externalPhone ??
                        thread.externalEmail ??
                        '—'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {thread.lastMessagePreview ?? '—'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {thread.customerId ? (
                      <Link
                        href={`/customers/${thread.customerId}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        مشتری
                      </Link>
                    ) : null}
                    {thread.leadId ? (
                      <Link
                        href={`/leads/${thread.leadId}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        سرنخ
                      </Link>
                    ) : null}
                    {canAssign ? (
                      <label
                        className="flex items-center gap-1 text-muted-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>مسئول:</span>
                        <select
                          className="rounded border border-input bg-background px-2 py-0.5 text-xs"
                          value={thread.assigneeId ?? ''}
                          disabled={assigningId === thread.id}
                          onChange={(e) =>
                            void handleAssign(thread.id, e.target.value || null)
                          }
                        >
                          <option value="">—</option>
                          {members.map((m) => (
                            <option key={m.userId} value={m.userId}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : thread.assigneeName ? (
                      <span className="text-muted-foreground">مسئول: {thread.assigneeName}</span>
                    ) : null}
                  </div>
                </button>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {thread.lastMessageAt ? <JalaliDate date={thread.lastMessageAt} showTime /> : '—'}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {selected ? (
        <InboxThreadPanel
          apiPath={`/api/inbox/${selected.id}`}
          title={`مکالمه — ${INBOX_CHANNEL_LABELS[selected.channel] ?? selected.channel}`}
          channel={channelPanelType(selected.channel)}
          readOnly={selected.channel === 'PHONE'}
        />
      ) : null}
    </div>
  );
}
