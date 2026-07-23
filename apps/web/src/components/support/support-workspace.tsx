'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LifeBuoy, Plus } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  body: string;
  status: string;
  priority: string;
  createdAt: string;
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

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'بالا',
  URGENT: 'فوری',
};

export function SupportWorkspace({ initialTicketId }: { initialTicketId?: string | null }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialTicketId ?? null);
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    const res = await fetch('/api/support/tickets');
    const json = await res.json();
    if (json?.success) setTickets(json.data ?? []);
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/support/tickets?id=${id}`);
    const json = await res.json();
    if (json?.success) setDetail(json.data);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadTickets();
      setLoading(false);
    })();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
    const tick = () => {
      if (document.visibilityState === 'visible') void loadDetail(selectedId);
    };
    const id = window.setInterval(tick, 10000);
    return () => window.clearInterval(id);
  }, [selectedId, loadDetail]);

  async function createTicket() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, priority }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error?.message ?? 'ثبت تیکت ناموفق بود');
        return;
      }
      toast.success('تیکت با موفقیت ثبت شد');
      setSubject('');
      setBody('');
      setShowForm(false);
      await loadTickets();
      setSelectedId(json.data.id);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedId, body: reply.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error?.message ?? 'ارسال پیام ناموفق بود');
        return;
      }
      setReply('');
      await loadDetail(selectedId);
      await loadTickets();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="پشتیبانی کسب‌یار"
        description="درخواست راهنمایی، گزارش مشکل یا پیشنهاد به تیم پشتیبانی"
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="ms-1 size-4" />
            تیکت جدید
          </Button>
        }
      />

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ثبت تیکت جدید</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ticket-subject">موضوع</Label>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="خلاصه درخواست"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-priority">اولویت</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="ticket-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-body">شرح درخواست</Label>
              <Textarea
                id="ticket-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="جزئیات مشکل یا درخواست را بنویسید…"
              />
            </div>
            <Button disabled={submitting} onClick={() => void createTicket()}>
              <LifeBuoy className="ms-1 size-4" />
              ارسال تیکت
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">در حال بارگذاری…</p>
            ) : tickets.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">هنوز تیکتی ثبت نشده است.</p>
            ) : (
              <ul>
                {tickets.map((t) => (
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
                        {STATUS_LABELS[t.status] ?? t.status} ·{' '}
                        {new Date(t.createdAt).toLocaleDateString('fa-IR')}
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
            <CardContent className="p-6 text-sm text-muted-foreground">
              یک تیکت را انتخاب کنید یا تیکت جدید بسازید.
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-base">{detail.subject}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABELS[detail.status] ?? detail.status} · اولویت{' '}
                  {PRIORITY_LABELS[detail.priority] ?? detail.priority}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {(detail.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm',
                      m.isPlatformReply && 'border-primary/30 bg-primary/5',
                    )}
                  >
                    <div className="text-xs font-medium">
                      {m.isPlatformReply ? 'پشتیبانی کسب‌یار' : m.user.name}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                    <time className="mt-1 block text-[10px] text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString('fa-IR')}
                    </time>
                  </div>
                ))}
                {detail.status !== 'CLOSED' ? (
                  <div className="flex gap-2 pt-2">
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="پیام تکمیلی…"
                      rows={2}
                    />
                    <Button disabled={submitting || !reply.trim()} onClick={() => void sendReply()}>
                      ارسال
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">این تیکت بسته شده است.</p>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
