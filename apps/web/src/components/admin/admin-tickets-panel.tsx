'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  organization: { name: string };
  user: { name: string; email: string };
  messages?: Array<{
    id: string;
    body: string;
    createdAt: string;
    isPlatformReply: boolean;
    user: { name: string };
  }>;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'باز',
  IN_PROGRESS: 'در حال بررسی',
  RESOLVED: 'حل‌شده',
  CLOSED: 'بسته',
};

export function AdminTicketsPanel({ initialTicketId }: { initialTicketId?: string | null }) {
  const [items, setItems] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialTicketId ?? null);
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadList = useCallback(async () => {
    const qs = filter !== 'ALL' ? `?status=${filter}` : '';
    const res = await fetch(`/api/admin/tickets${qs}`);
    const json = await res.json();
    if (json?.success) setItems(json.data.items ?? []);
  }, [filter]);

  const loadDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/tickets?id=${id}`);
    const json = await res.json();
    if (json?.success) setDetail(json.data);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadList();
      setLoading(false);
    })();
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedId, body: reply.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error?.message ?? 'ارسال پاسخ ناموفق بود');
        return;
      }
      toast.success('پاسخ ثبت شد');
      setReply('');
      await loadDetail(selectedId);
      await loadList();
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(status: string) {
    if (!selectedId) return;
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', ticketId: selectedId, status }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error?.message ?? 'تغییر وضعیت ناموفق بود');
      return;
    }
    toast.success('وضعیت به‌روزرسانی شد');
    await loadDetail(selectedId);
    await loadList();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تیکت‌های پشتیبانی</h1>
          <p className="text-sm text-muted-foreground">مدیریت درخواست‌های سازمان‌ها</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="فیلتر وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">همه</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">در حال بارگذاری…</p>
            ) : items.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">تیکتی یافت نشد.</p>
            ) : (
              <ul>
                {items.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full border-b px-3 py-3 text-start text-sm hover:bg-muted/50',
                        selectedId === t.id && 'bg-primary/5',
                      )}
                      onClick={() => setSelectedId(t.id)}
                    >
                      <div className="font-medium">{t.subject}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t.organization.name} · {t.user.name}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          {!detail ? (
            <CardContent className="p-6 text-sm text-muted-foreground">یک تیکت را انتخاب کنید.</CardContent>
          ) : (
            <>
              <CardHeader className="space-y-2">
                <CardTitle className="text-base">{detail.subject}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {detail.organization.name} · {detail.user.name} ({detail.user.email})
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
                    <Button key={s} size="sm" variant="outline" onClick={() => void setStatus(s)}>
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(detail.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm',
                      m.isPlatformReply && 'border-amber-500/30 bg-amber-500/5',
                    )}
                  >
                    <div className="text-xs font-medium">
                      {m.isPlatformReply ? 'پشتیبانی (شما)' : m.user.name}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="پاسخ به کاربر…"
                    rows={3}
                  />
                  <Button disabled={submitting || !reply.trim()} onClick={() => void sendReply()}>
                    ارسال پاسخ
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
