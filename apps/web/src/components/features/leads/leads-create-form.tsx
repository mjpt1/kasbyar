'use client';

import { LEAD_LABELS, LEAD_SOURCE_LABELS } from '@kesbyar/shared';
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

export function LeadsCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('OTHER');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          source,
          contactName: form.get('contactName') || undefined,
          contactPhone: form.get('contactPhone') || undefined,
          contactEmail: form.get('contactEmail') || undefined,
          description: form.get('description') || undefined,
          value: form.get('value') ? Number(form.get('value')) : undefined,
          nextFollowUpAt: form.get('nextFollowUpAt') || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? `ثبت ${LEAD_LABELS.singular} ناموفق بود`);
        return;
      }
      toast.success(`${LEAD_LABELS.singular} با موفقیت ثبت شد`);
      e.currentTarget.reset();
      setSource('OTHER');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>{LEAD_LABELS.new}</Button>;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ثبت {LEAD_LABELS.singular} جدید</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          بستن
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">عنوان *</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label>منبع</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">ارزش تقریبی (ریال)</Label>
            <Input id="value" name="value" type="number" min={0} dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">نام تماس</Label>
            <Input id="contactName" name="contactName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">تلفن تماس</Label>
            <Input id="contactPhone" name="contactPhone" dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextFollowUpAt">پیگیری بعدی</Label>
            <Input
              id="nextFollowUpAt"
              name="nextFollowUpAt"
              type="date"
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت...' : `ثبت ${LEAD_LABELS.singular}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
