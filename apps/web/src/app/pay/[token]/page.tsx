import { formatCurrencyWithOptionalToman } from '@kesbyar/shared';
import { AlertCircle, CheckCircle2, Receipt } from 'lucide-react';
import { notFound } from 'next/navigation';

import { PublicPayStartButton } from '@/components/features/payments/public-pay-start-button';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getInvoicePaymentAvailability } from '@/server/payments/gateways';
import { getPaymentLinkByToken } from '@/server/payments/invoice-payment.service';

export default async function PublicPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string; error?: string; msg?: string }>;
}) {
  const { token } = await params;
  const qs = await searchParams;
  const link = await getPaymentLinkByToken(token);
  if (!link) notFound();

  const invoice = link.invoice;
  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
  const showToman = invoice.organization.showTomanAlongside;
  const gateway = await getInvoicePaymentAvailability(link.organizationId);
  const alreadyPaid = remaining <= 0 || qs.paid === '1';
  const amountLabel = formatCurrencyWithOptionalToman(Math.max(remaining, 0), { showToman });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-rose-50/50 px-4 py-10 dark:from-sky-950/40 dark:via-background dark:to-rose-950/20"
      dir="rtl"
    >
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span
            className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-200/90 to-amber-100 text-foreground shadow-sm"
            aria-hidden
          >
            <Receipt className="size-4" />
          </span>
          <span>پرداخت امن فاکتور</span>
        </div>

        <Card className="border-white/80 shadow-sm dark:border-border">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl tracking-tight">{invoice.organization.name}</CardTitle>
            <CardDescription>
              فاکتور{' '}
              <span dir="ltr" className="font-mono text-foreground">
                {invoice.number}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {qs.error ? (
              <div
                role="alert"
                className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>{qs.error}</p>
              </div>
            ) : null}

            {alreadyPaid ? (
              <div
                role="status"
                className="flex gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:text-emerald-100"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>{qs.msg || 'پرداخت با موفقیت انجام شد. متشکریم.'}</p>
              </div>
            ) : null}

            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">مشتری</dt>
                <dd className="font-medium">{invoice.customer.name}</dd>
              </div>
              {invoice.dueDate ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted-foreground">سررسید</dt>
                  <dd>
                    <JalaliDate date={invoice.dueDate} />
                  </dd>
                </div>
              ) : null}
              <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-rose-50/40 p-4 dark:border-sky-900/40 dark:from-sky-950/30 dark:to-rose-950/20">
                <p className="text-xs text-muted-foreground">مبلغ قابل پرداخت</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                  {amountLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">مبالغ بر حسب ریال ذخیره می‌شوند.</p>
              </div>
            </dl>

            {!alreadyPaid ? (
              <PublicPayStartButton
                token={token}
                gatewayConfigured={gateway.configured}
                setupHint={gateway.setupHintFa}
              />
            ) : null}

            {!gateway.configured && !alreadyPaid ? (
              <p className="text-center text-xs text-muted-foreground">{gateway.setupHintFa}</p>
            ) : null}

            {gateway.configured && gateway.sandbox && !alreadyPaid ? (
              <p
                role="note"
                className="rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-center text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
              >
                حالت آزمایشی (Sandbox) درگاه فعال است — مبلغ واقعی کسر نمی‌شود.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
