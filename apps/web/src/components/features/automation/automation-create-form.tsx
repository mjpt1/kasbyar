'use client';

import {
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_TRIGGER_LABELS,
} from '@kesbyar/shared';
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

export function AutomationCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState('INVOICE_OVERDUE');
  const [action, setAction] = useState('CREATE_TASK');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          description: form.get('description') || undefined,
          trigger,
          action,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت قانون ناموفق بود');
        return;
      }
      toast.success('قانون اتوماسیون ثبت شد');
      e.currentTarget.reset();
      setTrigger('INVOICE_OVERDUE');
      setAction('CREATE_TASK');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>قانون جدید</Button>;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ثبت قانون اتوماسیون</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          بستن
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">نام قانون *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label>ماشه (تریگر)</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AUTOMATION_TRIGGER_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>اقدام</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AUTOMATION_ACTION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت قانون'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
