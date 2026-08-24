'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

type Pack = 'clinic' | 'beauty';

export function AppointmentCancelButton({
  appointmentId,
  pack,
  disabled,
}: {
  appointmentId: string;
  pack: Pack;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const url =
        pack === 'clinic'
          ? `/api/packs/clinic/appointments/${appointmentId}`
          : `/api/packs/beauty/${appointmentId}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'لغو نوبت ناموفق بود');
        return;
      }
      toast.success('نوبت لغو شد');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled || loading}
      onClick={() => void cancel()}
    >
      {loading ? '...' : 'لغو'}
    </Button>
  );
}
