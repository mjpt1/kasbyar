'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export function PublicPayStartButton({
  token,
  gatewayConfigured,
  setupHint,
}: {
  token: string;
  gatewayConfigured: boolean;
  setupHint?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function startPay() {
    if (!gatewayConfigured) {
      toast.error(setupHint || 'درگاه پرداخت پیکربندی نشده است. از تنظیمات یکپارچه‌سازی کلید را وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/pay/${token}/start`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'شروع پرداخت ناموفق بود');
        return;
      }
      window.location.href = data.data.paymentUrl;
    } catch {
      toast.error('خطا در ارتباط با درگاه. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      className="min-h-11 w-full text-base"
      disabled={loading || !gatewayConfigured}
      onClick={startPay}
      aria-busy={loading}
      aria-disabled={!gatewayConfigured}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          در حال انتقال…
        </>
      ) : gatewayConfigured ? (
        'پرداخت آنلاین'
      ) : (
        'درگاه هنوز فعال نیست'
      )}
    </Button>
  );
}
