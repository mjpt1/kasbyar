'use client';

import { INVOICE_STATUS_LABELS } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InvoiceStatusActionsProps {
  invoiceId: string;
  currentStatus: string;
}

export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
}: InvoiceStatusActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    if (
      status === 'CANCELLED' &&
      status !== currentStatus &&
      !window.confirm('آیا از لغو این فاکتور مطمئن هستید؟ این عمل قابل بازگشت ساده نیست.')
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'تغییر وضعیت ناموفق بود');
        return;
      }
      toast.success('وضعیت فاکتور به‌روزرسانی شد');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(INVOICE_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="secondary"
        onClick={updateStatus}
        disabled={loading || status === currentStatus}
      >
        {loading ? 'در حال اعمال…' : 'اعمال وضعیت'}
      </Button>
    </div>
  );
}
