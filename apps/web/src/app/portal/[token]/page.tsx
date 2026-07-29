import { formatCurrencyWithOptionalToman } from '@kesbyar/shared';
import { Receipt } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { JalaliDate } from '@/components/shared/jalali-date';
import { InvoiceStatusBadge } from '@/components/shared/status-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomerPortalByToken } from '@/server/portal/customer-portal.service';

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const portal = await getCustomerPortalByToken(token);
  if (!portal) notFound();

  const showToman = portal.organization.showTomanAlongside;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-sky-50/50 px-4 py-10 dark:from-violet-950/30 dark:via-background dark:to-sky-950/20"
      dir="rtl"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span
            className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-200/90 to-sky-100 text-foreground shadow-sm"
            aria-hidden
          >
            <Receipt className="size-4" />
          </span>
          <span>پورتال مشتری — {portal.organization.name}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{portal.customer.name}</CardTitle>
            <CardDescription>
              فاکتورها و پرداخت آنلاین — اعتبار لینک تا{' '}
              <JalaliDate date={portal.expiresAt} showTime />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portal.invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">فاکتور فعالی ثبت نشده است.</p>
            ) : (
              <ul className="space-y-3" role="list">
                {portal.invoices.map((invoice) => {
                  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
                  const amountLabel = formatCurrencyWithOptionalToman(
                    Math.max(remaining, 0),
                    { showToman },
                  );
                  return (
                    <li
                      key={invoice.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium" dir="ltr">
                            {invoice.number}
                          </span>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          صدور: <JalaliDate date={invoice.issueDate} />
                          {invoice.dueDate ? (
                            <>
                              {' '}
                              — سررسید: <JalaliDate date={invoice.dueDate} />
                            </>
                          ) : null}
                        </p>
                        {remaining > 0 ? (
                          <p className="text-sm">مانده: {amountLabel}</p>
                        ) : (
                          <p className="text-sm text-emerald-700">تسویه شده</p>
                        )}
                      </div>
                      {invoice.payUrl && remaining > 0 ? (
                        <Button asChild size="sm">
                          <Link href={invoice.payUrl}>پرداخت آنلاین</Link>
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
