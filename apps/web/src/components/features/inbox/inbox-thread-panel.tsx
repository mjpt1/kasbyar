'use client';

import type { InboxMessageItem } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { JalaliDate } from '@/components/shared/jalali-date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type InboxThreadPanelProps = {
  apiPath: string;
  title?: string;
  channel?: 'whatsapp' | 'sms' | 'email' | 'phone' | 'telegram' | 'instagram';
  readOnly?: boolean;
  emptyHint?: string;
};

export function InboxThreadPanel({
  apiPath,
  title = 'مکالمه',
  channel = 'whatsapp',
  readOnly = false,
  emptyHint,
}: InboxThreadPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState<string | null>(null);
  const [messages, setMessages] = useState<InboxMessageItem[]>([]);
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      if (!data.success) {
        setThreadId(null);
        setMessages([]);
        return;
      }
      setThreadId(data.data.thread?.id ?? null);
      setAssigneeName(data.data.thread?.assignee?.name ?? null);
      setMessages(data.data.items ?? []);
    } catch {
      toast.error('بارگذاری مکالمه ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!threadId || !content.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/inbox/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ...(channel === 'email' && subject ? { subject } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ارسال پیام ناموفق بود');
        return;
      }
      if (data.data.deliveryStatus === 'failed') {
        toast.warning(data.data.errorMessage ?? 'پیام در سیستم ثبت شد اما ارسال واتساپ ناموفق بود');
      } else {
        toast.success('پیام ارسال شد');
      }
      setContent('');
      await load();
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
        </CardContent>
      </Card>
    );
  }

  if (!threadId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {emptyHint ??
              'شماره موبایل/ایمیل معتبر ثبت نشده یا اتصال کانال پیکربندی نشده است.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {assigneeName ? (
          <p className="text-xs text-muted-foreground">مسئول: {assigneeName}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">پیامی ثبت نشده.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-md px-3 py-2 text-sm ${
                  message.direction === 'OUTBOUND'
                    ? 'ms-8 bg-primary/10'
                    : 'me-8 bg-muted'
                }`}
              >
                <div>{message.content}</div>
                {channel === 'phone' && message.recordingUrl ? (
                  <div className="mt-2 space-y-1">
                    <audio
                      controls
                      preload="none"
                      className="h-9 w-full max-w-xs"
                      src={message.recordingUrl}
                    >
                      مرورگر از پخش صوت پشتیبانی نمی‌کند.
                    </audio>
                    <a
                      href={message.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      دانلود ضبط تماس
                    </a>
                  </div>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {message.senderName ? <span>{message.senderName}</span> : null}
                  {channel === 'phone' && message.durationSeconds ? (
                    <span>{Math.round(message.durationSeconds / 60)} دقیقه</span>
                  ) : null}
                  {channel === 'phone' && message.agentExtension ? (
                    <span>داخلی {message.agentExtension}</span>
                  ) : null}
                  <JalaliDate date={message.sentAt} showTime />
                  {message.status === 'failed' ? <span className="text-destructive">ناموفق</span> : null}
                </div>
              </div>
            ))
          )}
        </div>

        {!readOnly ? (
          <form onSubmit={sendMessage} className="space-y-3">
            {channel === 'email' ? (
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="موضوع ایمیل"
              />
            ) : null}
            <Textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                channel === 'email'
                  ? 'متن ایمیل...'
                  : channel === 'sms'
                    ? 'متن پیامک...'
                    : channel === 'telegram'
                      ? 'پیام تلگرام...'
                      : channel === 'instagram'
                        ? 'پیام اینستاگرام...'
                        : 'پیام واتساپ...'
              }
            />
            <Button type="submit" disabled={sending || !content.trim()}>
              {sending ? 'در حال ارسال...' : 'ارسال پیام'}
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">
            تماس‌ها از webhook PBX/VoIP ثبت می‌شوند.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
