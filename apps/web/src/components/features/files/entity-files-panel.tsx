'use client';

import type { FileEntityType } from '@prisma/client';
import { formatJalali } from '@kesbyar/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EntityFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

interface EntityFilesPanelProps {
  entityType: FileEntityType;
  entityId: string;
  files: EntityFile[];
  title?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

export function EntityFilesPanel({
  entityType,
  entityId,
  files,
  title = 'پیوست‌ها',
}: EntityFilesPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      toast.error('فایل را انتخاب کنید');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      const res = await fetch('/api/files', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'آپلود ناموفق بود');
        return;
      }
      toast.success('فایل پیوست شد');
      form.reset();
      router.refresh();
    } catch {
      toast.error('خطا در آپلود');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(fileId: string) {
    if (!confirm('این فایل حذف شود؟')) return;
    try {
      const res = await fetch(`/api/files?id=${fileId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'حذف ناموفق بود');
        return;
      }
      toast.success('فایل حذف شد');
      router.refresh();
    } catch {
      toast.error('خطا در حذف');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onUpload} className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-full space-y-2 sm:basis-auto sm:min-w-[12rem]">
            <Label htmlFor={`file-${entityId}`}>آپلود فایل</Label>
            <Input id={`file-${entityId}`} name="file" type="file" required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'در حال آپلود...' : 'پیوست'}
          </Button>
        </form>

        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">پیوستی ثبت نشده.</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div>
                  <div className="font-medium">{file.fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file.sizeBytes)} · {formatJalali(file.createdAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/api/files/${file.id}`} target="_blank">
                      دانلود
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(file.id)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
