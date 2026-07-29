'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export function ExportCsvButton({
  entity,
  label = 'خروجی CSV',
}: {
  entity: 'customers' | 'leads' | 'invoices';
  label?: string;
}) {
  async function download() {
    try {
      const res = await fetch(`/api/export/${entity}`);
      if (!res.ok) {
        toast.error('دریافت خروجی ناموفق بود');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('فایل CSV آماده شد');
    } catch {
      toast.error('خطا در دانلود');
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void download()}>
      <Download className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
