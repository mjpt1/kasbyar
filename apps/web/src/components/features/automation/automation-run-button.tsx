'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export function AutomationRunButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch('/api/automation/run', { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'اجرای اتوماسیون ناموفق بود');
        return;
      }
      const count = data.data.executedRules as number;
      toast.success(
        count > 0
          ? `${count} قانون اجرا شد`
          : 'قانون فعالی برای اجرا نبود یا موردی یافت نشد',
      );
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={run} disabled={loading}>
      {loading ? 'در حال اجرا...' : 'اجرای قوانین فعال'}
    </Button>
  );
}
