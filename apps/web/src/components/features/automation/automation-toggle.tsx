'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AutomationToggleProps {
  ruleId: string;
  isActive: boolean;
}

export function AutomationToggle({ ruleId, isActive }: AutomationToggleProps) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !active;
    setLoading(true);
    try {
      const res = await fetch(`/api/automation/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'تغییر وضعیت ناموفق بود');
        return;
      }
      setActive(next);
      toast.success(next ? 'قانون فعال شد' : 'قانون غیرفعال شد');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={active ? 'success' : 'secondary'}>
        {active ? 'فعال' : 'غیرفعال'}
      </Badge>
      <Button size="sm" variant="outline" onClick={toggle} disabled={loading}>
        {loading ? '...' : active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
      </Button>
    </div>
  );
}
