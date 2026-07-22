'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { MOADIAN_STATUS_LABELS } from '@kesbyar/shared';
import { CheckCircle2, CircleAlert, Download, FileCheck2, Loader2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChecklistItem {
  id: string;
  labelFa: string;
  ok: boolean;
  hintFa?: string;
}

interface InvoiceMoadianPanelProps {
  invoiceId: string;
  moadianStatus: string;
}

function statusVariant(
  status: string,
): 'success' | 'warning' | 'secondary' | 'outline' {
  if (status === 'SUBMITTED' || status === 'ACCEPTED') return 'success';
  if (status === 'REJECTED') return 'warning';
  if (status === 'READY') return 'secondary';
  return 'outline';
}

export function InvoiceMoadianPanel({ invoiceId, moadianStatus }: InvoiceMoadianPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'prepare' | 'mark' | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [modeLabel, setModeLabel] = useState('');
  const [ready, setReady] = useState(false);
  const [payloadJson, setPayloadJson] = useState('');

  async function prepare() {
    setLoading('prepare');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/moadian`);
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'آماده‌سازی ناموفق بود');
        return;
      }
      setOpen(true);
      setItems(data.data.readiness.items);
      setReady(data.data.readiness.ready);
      setModeLabel(data.data.modeLabelFa);
      setPayloadJson(JSON.stringify(data.data.payload, null, 2));
      router.refresh();
    } catch {
      toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(null);
    }
  }

  async function downloadExport() {
    let json = payloadJson;
    if (!json) {
      setLoading('prepare');
      try {
        const res = await fetch(`/api/invoices/${invoiceId}/moadian`);
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error?.message ?? 'آماده‌سازی ناموفق بود');
          return;
        }
        setOpen(true);
        setItems(data.data.readiness.items);
        setReady(data.data.readiness.ready);
        setModeLabel(data.data.modeLabelFa);
        json = JSON.stringify(data.data.payload, null, 2);
        setPayloadJson(json);
        router.refresh();
      } catch {
        toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
        return;
      } finally {
        setLoading(null);
      }
    }
    const blob = new Blob([json || '{}'], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moadian-${invoiceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function markUploaded() {
    setLoading('mark');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/moadian`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualUpload: true }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت وضعیت ناموفق بود');
        return;
      }
      toast.message('وضعیت به‌روز شد', { description: data.data.noticeFa });
      router.refresh();
    } catch {
      toast.error('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;
  const missing = items.filter((i) => !i.ok);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <FileCheck2 className="size-4" aria-hidden />
            </span>
            سامانه مؤدیان
          </CardTitle>
          <CardDescription className="ms-10 max-w-2xl">
            آماده‌سازی داده و خروجی استاندارد. ارسال زنده فقط با گواهی حافظه یا واسط پیکربندی‌شده؛
            در غیر این صورت به‌صورت کاذب «موفق» اعلام نمی‌شود.
          </CardDescription>
        </div>
        <Badge variant={statusVariant(moadianStatus)} className="shrink-0">
          {MOADIAN_STATUS_LABELS[moadianStatus] ?? moadianStatus}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="min-h-9"
            disabled={busy}
            onClick={prepare}
            aria-busy={loading === 'prepare'}
          >
            {loading === 'prepare' ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <FileCheck2 className="size-4" aria-hidden />
            )}
            آماده‌سازی برای مؤدیان
          </Button>
          {open ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-9"
                disabled={busy}
                onClick={downloadExport}
              >
                <Download className="size-4" aria-hidden />
                دانلود JSON
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-9"
                disabled={busy || !ready}
                onClick={markUploaded}
                aria-busy={loading === 'mark'}
                title={!ready ? 'ابتدا موارد ناقص چک‌لیست را تکمیل کنید' : undefined}
              >
                {loading === 'mark' ? (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                ) : (
                  <Upload className="size-4" aria-hidden />
                )}
                ثبت بارگذاری دستی
              </Button>
            </>
          ) : null}
        </div>

        {open ? (
          <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">{modeLabel}</p>
            <ul className="space-y-2" role="list" aria-label="چک‌لیست آمادگی مؤدیان">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors"
                >
                  {item.ok ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-label="تکمیل"
                    />
                  ) : (
                    <CircleAlert
                      className="mt-0.5 size-4 shrink-0 text-amber-600"
                      aria-label="نیاز به تکمیل"
                    />
                  )}
                  <div className="min-w-0 space-y-0.5">
                    <p className={item.ok ? 'text-foreground' : 'font-medium text-foreground'}>
                      {item.labelFa}
                    </p>
                    {!item.ok && item.hintFa ? (
                      <p className="text-xs text-muted-foreground">{item.hintFa}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            {missing.length > 0 ? (
              <p className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
                موارد ناقص را از{' '}
                <Link
                  href="/settings"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  تنظیمات سازمان و یکپارچه‌سازی
                </Link>{' '}
                تکمیل کنید.
              </p>
            ) : (
              <p className="border-t border-border/60 pt-3 text-xs text-emerald-800 dark:text-emerald-200">
                چک‌لیست کامل است — می‌توانید خروجی را دانلود یا بارگذاری دستی را ثبت کنید.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
