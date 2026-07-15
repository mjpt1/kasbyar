'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function LeadsFollowUpForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState('');
  const [nextDate, setNextDate] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) {
      toast.error('متن پیگیری الزامی است');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note,
          channel: channel || undefined,
          nextFollowUpAt: nextDate || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت پیگیری ناموفق بود');
        return;
      }
      toast.success('پیگیری ثبت شد');
      setNote('');
      setChannel('');
      setNextDate('');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ثبت پیگیری جدید</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="follow-note">یادداشت پیگیری *</Label>
            <Textarea
              id="follow-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="نتیجه تماس، پیشنهاد، یا اقدام بعدی..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="follow-channel">کانال</Label>
            <Input
              id="follow-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="تماس، واتساپ، حضوری..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="follow-next">پیگیری بعدی</Label>
            <Input
              id="follow-next"
              type="date"
              dir="ltr"
              className="text-left"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت پیگیری'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
