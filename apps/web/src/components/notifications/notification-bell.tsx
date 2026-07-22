'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  href: string | null;
  category: string;
  readAt: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json?.success && json.data) {
        setItems(json.data.items ?? []);
        setUnread(json.data.unread ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') void load();
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    });
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnread((u) => Math.max(0, u - 1));
  }

  async function markAll() {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read-all' }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative shrink-0"
        aria-label="اعلان‌ها"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -top-1 -start-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? '۹+' : unread.toLocaleString('fa-IR')}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute end-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold">اعلان‌ها</span>
            {unread > 0 ? (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => void markAll()}
              >
                همه خوانده شد
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">در حال بارگذاری…</p>
            ) : null}
            {!loading && items.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">اعلان جدیدی نیست</p>
            ) : null}
            {items.map((n) => {
              const content = (
                <div
                  className={cn(
                    'border-b px-3 py-2.5 text-start transition-colors hover:bg-muted/50',
                    !n.readAt && 'bg-primary/5',
                  )}
                >
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                </div>
              );
              if (n.href) {
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      if (!n.readAt) void markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <button
                  key={n.id}
                  type="button"
                  className="block w-full"
                  onClick={() => {
                    if (!n.readAt) void markRead(n.id);
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
