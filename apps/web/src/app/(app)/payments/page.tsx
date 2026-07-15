import { Suspense } from 'react';
import { formatCurrency, PAYMENT_METHOD_LABELS } from '@kesbyar/shared';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

import { PaymentsCreateForm } from '@/components/features/payments/payments-create-form';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { listCustomers } from '@/server/customers/customer.service';
import { listInvoices } from '@/server/invoices/invoice.service';
import { listPayments } from '@/server/payments/payment.service';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    customerId?: string;
    invoiceId?: string;
    amount?: string;
  }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const [paymentsResult, customersResult, invoicesResult] = await Promise.all([
    listPayments(session.organizationId, {}),
    listCustomers(session.organizationId, { pageSize: 100 }),
    listInvoices(session.organizationId, { pageSize: 100 }),
  ]);

  const customers = customersResult.items.map((c) => ({ id: c.id, name: c.name }));
  const invoices = invoicesResult.items.map((inv) => ({
    id: inv.id,
    number: inv.number,
    customerId: inv.customerId,
    remaining: Number(inv.total) - Number(inv.paidAmount),
  }));

  const autoOpen = Boolean(params.customerId || params.invoiceId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="پرداخت‌ها"
        description={`${paymentsResult.total} پرداخت ثبت‌شده`}
      />

      <Suspense fallback={<LoadingState label="در حال آماده‌سازی فرم…" className="py-4" />}>
        <PaymentsCreateForm
          customers={customers}
          invoices={invoices}
          defaultCustomerId={params.customerId}
          defaultInvoiceId={params.invoiceId}
          defaultAmount={params.amount ? Number(params.amount) : undefined}
          autoOpen={autoOpen}
        />
      </Suspense>

      {paymentsResult.items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="هنوز پرداختی ثبت نشده"
          description="دریافت‌های مشتریان را اینجا ثبت کنید یا از صفحه فاکتور «ثبت پرداخت» را بزنید."
          actionLabel="رفتن به فاکتورها"
          actionHref="/invoices"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-right font-medium">مشتری</th>
                    <th className="p-3 text-right font-medium">فاکتور</th>
                    <th className="p-3 text-right font-medium">مبلغ</th>
                    <th className="p-3 text-right font-medium">روش</th>
                    <th className="p-3 text-right font-medium">وضعیت</th>
                    <th className="p-3 text-right font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsResult.items.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <Link
                          href={`/customers/${payment.customer.id}`}
                          className="text-primary hover:underline"
                        >
                          {payment.customer.name}
                        </Link>
                      </td>
                      <td className="p-3">
                        {payment.invoice ? (
                          <Link
                            href={`/invoices/${payment.invoice.id}`}
                            className="text-primary hover:underline"
                          >
                            {payment.invoice.number}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 font-medium">
                        {formatCurrency(Number(payment.amount))}
                      </td>
                      <td className="p-3">
                        {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                      </td>
                      <td className="p-3">
                        <Badge variant={payment.status === 'COMPLETED' ? 'success' : 'secondary'}>
                          {payment.status === 'COMPLETED' ? 'تکمیل‌شده' : payment.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <JalaliDate date={payment.paidAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
