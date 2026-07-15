'use client';

import { formatJalaliDateTime } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReminderItem {
  id: string;
  title: string;
  message: string | null;
  remindAt: string;
}

interface RemindersPanelProps {
  reminders: ReminderItem[];
}

export function RemindersPanel({ reminders }: RemindersPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [remindAt, setRemindAt] = useState('');

  async function createReminder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message: message || undefined, remindAt }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت یادآور ناموفق بود');
        return;
      }
      toast.success('یادآور ثبت شد');
      setTitle('');
      setMessage('');
      setRemindAt('');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">یادآورهای پیش‌رو</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">یادآوری ثبت نشده.</p>
          ) : (
            reminders.map((r) => (
              <div key={r.id} className="rounded-md border p-3">
                <div className="font-medium">{r.title}</div>
                {r.message ? (
                  <div className="text-sm text-muted-foreground">{r.message}</div>
                ) : null}
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatJalaliDateTime(r.remindAt)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">یادآور جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createReminder} className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-title">عنوان *</Label>
              <Input
                id="reminder-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-message">پیام</Label>
              <Textarea
                id="reminder-message"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-at">زمان یادآوری *</Label>
              <Input
                id="reminder-at"
                type="datetime-local"
                dir="ltr"
                className="text-left"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت یادآور'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
