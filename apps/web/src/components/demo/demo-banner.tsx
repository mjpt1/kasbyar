'use client';

import Link from 'next/link';
import { Presentation, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="flex items-center gap-2">
        <Presentation className="h-4 w-4 shrink-0" />
        <span>
          <strong>محیط نمایش</strong> — داده‌های دمو؛ برای فروش و سرمایه‌گذار
        </span>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="h-8 border-amber-300 bg-white/80">
          <Link href="/demo">مرکز نمایش</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 border-amber-300 bg-white/80">
          <Link href="/demo/investor">نمای سرمایه‌گذار</Link>
        </Button>
      </div>
    </div>
  );
}

export function DemoResetButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function reset() {
    if (
      !window.confirm(
        'همه داده‌های دمو به حالت seed اولیه بازمی‌گردد. ادامه می‌دهید؟',
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'بازنشانی ناموفق');
        return;
      }
      toast.success('دمو بازنشانی شد');
      router.push('/demo');
      router.refresh();
    } catch {
      toast.error('خطا در بازنشانی');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1 text-amber-900 hover:bg-amber-100 dark:text-amber-100"
      disabled={loading}
      onClick={reset}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {loading ? 'در حال بازنشانی...' : 'بازنشانی دمو'}
    </Button>
  );
}
