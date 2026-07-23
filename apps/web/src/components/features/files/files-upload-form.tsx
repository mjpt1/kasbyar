'use client';

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

const ENTITY_OPTIONS = [
  { value: 'ORGANIZATION', label: 'سازمان' },
  { value: 'CUSTOMER', label: 'مشتری' },
  { value: 'LEAD', label: 'سرنخ فروش' },
  { value: 'INVOICE', label: 'فاکتور' },
  { value: 'TASK', label: 'وظیفه' },
] as const;

interface FilesUploadFormProps {
  defaultEntityType?: string;
  defaultEntityId?: string;
}

export function FilesUploadForm({
  defaultEntityType = 'ORGANIZATION',
  defaultEntityId,
}: FilesUploadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState(defaultEntityType);
  const [entityId, setEntityId] = useState(defaultEntityId ?? '');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      toast.error('فایل را انتخاب کنید');
      return;
    }
    if (!entityId.trim()) {
      toast.error('شناسه موجودیت الزامی است');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId.trim());

      const res = await fetch('/api/files', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'آپلود ناموفق بود');
        return;
      }
      toast.success('فایل آپلود شد');
      form.reset();
      router.refresh();
    } catch {
      toast.error('خطا در آپلود');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">آپلود فایل</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>نوع موجودیت</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entity-id">شناسه موجودیت *</Label>
            <Input
              id="entity-id"
              dir="ltr"
              className="text-left font-mono text-xs"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="cuid..."
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="file">فایل *</Label>
            <Input id="file" name="file" type="file" required />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال آپلود...' : 'آپلود'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
