import { Suspense } from 'react';
import { formatCurrency, PAYMENT_METHOD_LABELS } from '@kesbyar/shared';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

import { PaymentsCreateForm } from '@/components/features/payments/payments-create-form';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { LoadingState } from '@/components/shared/loading-state';
import { ResponsiveTable } from '@/components/shared/responsive-table';
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
          <CardContent className="p-3 md:p-0">
            <ResponsiveTable
              columns={[
                { key: 'customer', header: 'مشتری' },
                { key: 'invoice', header: 'فاکتور' },
                { key: 'amount', header: 'مبلغ' },
                { key: 'method', header: 'روش', hideOnMobile: true },
                { key: 'status', header: 'وضعیت' },
                { key: 'date', header: 'تاریخ' },
              ]}
              rows={paymentsResult.items.map((payment) => ({
                id: payment.id,
                cells: {
                  customer: (
                    <Link
                      href={`/customers/${payment.customer.id}`}
                      className="text-primary hover:underline"
                    >
                      {payment.customer.name}
                    </Link>
                  ),
                  invoice: payment.invoice ? (
                    <Link
                      href={`/invoices/${payment.invoice.id}`}
                      className="text-primary hover:underline"
                    >
                      {payment.invoice.number}
                    </Link>
                  ) : (
                    '—'
                  ),
                  amount: (
                    <span className="font-medium">{formatCurrency(Number(payment.amount))}</span>
                  ),
                  method: PAYMENT_METHOD_LABELS[payment.method] ?? payment.method,
                  status: (
                    <Badge variant={payment.status === 'COMPLETED' ? 'success' : 'secondary'}>
                      {payment.status === 'COMPLETED' ? 'تکمیل‌شده' : payment.status}
                    </Badge>
                  ),
                  date: <JalaliDate date={payment.paidAt} />,
                },
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
