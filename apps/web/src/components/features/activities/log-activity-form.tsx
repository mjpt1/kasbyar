'use client';

import { ACTIVITY_TYPE_LABELS } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

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

type LogActivityFormProps = {
  customerId?: string;
  leadId?: string;
  defaultType?: 'CALL' | 'MEETING' | 'NOTE' | 'EMAIL';
};

const TYPE_OPTIONS = ['CALL', 'MEETING', 'NOTE', 'EMAIL'] as const;

export function LogActivityForm({
  customerId,
  leadId,
  defaultType = 'CALL',
}: LogActivityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>(defaultType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [outcome, setOutcome] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('عنوان فعالیت الزامی است');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description: description || undefined,
          customerId,
          leadId,
          durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
          outcome: outcome || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت فعالیت ناموفق بود');
        return;
      }
      toast.success('فعالیت ثبت شد');
      setTitle('');
      setDescription('');
      setDurationMinutes('');
      setOutcome('');
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
        <CardTitle className="text-base">ثبت تماس / جلسه / فعالیت</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="activity-type">نوع فعالیت</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger id="activity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ACTIVITY_TYPE_LABELS[option] ?? option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-title">عنوان *</Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً تماس پیگیری پیش‌فاکتور"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="activity-description">جزئیات</Label>
            <Textarea
              id="activity-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="خلاصه مکالمه، توافق‌ها، یا اقدام بعدی..."
            />
          </div>
          {(type === 'CALL' || type === 'MEETING') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="activity-duration">مدت (دقیقه)</Label>
                <Input
                  id="activity-duration"
                  type="number"
                  min={1}
                  dir="ltr"
                  className="text-left"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-outcome">نتیجه</Label>
                <Input
                  id="activity-outcome"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="موفق، نیاز به پیگیری، ..."
                />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت فعالیت'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
