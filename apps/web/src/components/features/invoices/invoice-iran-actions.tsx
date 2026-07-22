'use client';

import { Bell, Link2, Loader2, MessageSquare, Printer } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface InvoiceIranActionsProps {
  invoiceId: string;
  canPayOnline: boolean;
  customerHasPhone: boolean;
}

export function InvoiceIranActions({
  invoiceId,
  canPayOnline,
  customerHasPhone,
}: InvoiceIranActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const busy = loading !== null;

  async function copyPaymentLink() {
    setLoading('link');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payment-link`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ساخت لینک ناموفق بود');
        return;
      }
      const url = data.data.publicUrl as string;
      await navigator.clipboard.writeText(url);
      if (!data.data.gateway?.configured) {
        toast.message('لینک کپی شد', {
          description:
            data.data.gateway?.setupHintFa ??
            'درگاه هنوز پیکربندی نشده؛ مشتری صفحه را می‌بیند ولی پرداخت آنلاین فعال نیست. از تنظیمات یکپارچه‌سازی کلید را وارد کنید.',
        });
      } else {
        toast.success('لینک پرداخت کپی شد');
      }
    } catch {
      toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(null);
    }
  }

  async function smsPaymentLink() {
    setLoading('sms_link');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sms_link' }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ارسال پیامک ناموفق بود');
        return;
      }
      if (data.data.status === 'queued') {
        toast.message('لینک ساخته شد؛ پیامک واقعی ارسال نشد', {
          description: 'کلید کاوه‌نگار در تنظیمات یکپارچه‌سازی ثبت نشده است.',
        });
      } else {
        toast.success('پیامک لینک پرداخت ارسال شد');
      }
    } catch {
      toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(null);
    }
  }

  async function smsDue() {
    setLoading('sms_due');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sms_due' }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ارسال یادآوری ناموفق بود');
        return;
      }
      toast.success(
        data.data.status === 'sent'
          ? 'یادآوری پیامک شد'
          : 'یادآوری ثبت شد — برای ارسال واقعی، کلید کاوه‌نگار را در تنظیمات وارد کنید',
      );
    } catch {
      toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="اقدامات پرداخت و پیامک"
    >
      {canPayOnline ? (
        <>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="min-h-9"
            disabled={busy}
            onClick={copyPaymentLink}
            aria-busy={loading === 'link'}
          >
            {loading === 'link' ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <Link2 className="size-4" aria-hidden />
            )}
            کپی لینک پرداخت
          </Button>
          {customerHasPhone ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9"
              disabled={busy}
              onClick={smsPaymentLink}
              aria-busy={loading === 'sms_link'}
            >
              {loading === 'sms_link' ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
              ) : (
                <MessageSquare className="size-4" aria-hidden />
              )}
              ارسال لینک با پیامک
            </Button>
          ) : null}
        </>
      ) : null}
      {customerHasPhone ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9"
          disabled={busy}
          onClick={smsDue}
          aria-busy={loading === 'sms_due'}
        >
          {loading === 'sms_due' ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <Bell className="size-4" aria-hidden />
          )}
          یادآوری سررسید
        </Button>
      ) : canPayOnline ? (
        <p className="text-xs text-muted-foreground">برای پیامک، شماره مشتری را تکمیل کنید.</p>
      ) : null}
      <Button asChild variant="outline" size="sm" className="min-h-9">
        <Link href={`/invoices/${invoiceId}/print`}>
          <Printer className="size-4" aria-hidden />
          چاپ رسمی
        </Link>
      </Button>
    </div>
  );
}
