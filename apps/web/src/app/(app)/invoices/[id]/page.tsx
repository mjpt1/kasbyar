import { formatCurrency, PAYMENT_METHOD_LABELS } from '@kesbyar/shared';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InvoiceStatusActions } from '@/components/features/invoices/invoice-status-actions';
import { EntityFilesPanel } from '@/components/features/files/entity-files-panel';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { InvoiceStatusBadge } from '@/components/shared/status-badges';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { getInvoice } from '@/server/invoices/invoice.service';
import { listFileAttachments } from '@/server/files/file.service';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const invoice = await getInvoice(session.organizationId, id);

  if (!invoice) {
    notFound();
  }

  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
  const files = await listFileAttachments(session.organizationId, {
    entityType: 'INVOICE',
    entityId: id,
  });

  const fileRows = files.map((f) => ({
    id: f.id,
    fileName: f.fileName,
    mimeType: f.mimeType,
    sizeBytes: f.sizeBytes,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.number}
        description={invoice.customer.name}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />
            <Link
              href={`/payments?invoiceId=${invoice.id}&customerId=${invoice.customerId}&amount=${remaining}`}
              className="text-sm text-primary hover:underline"
            >
              ثبت پرداخت
            </Link>
            <Link href="/invoices" className="text-sm text-muted-foreground hover:text-foreground">
              بازگشت
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">وضعیت</div>
            <div className="mt-1">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">مبلغ کل</div>
            <div className="mt-1 text-lg font-semibold">
              {formatCurrency(Number(invoice.total))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">پرداخت‌شده</div>
            <div className="mt-1 text-lg font-semibold">
              {formatCurrency(Number(invoice.paidAmount))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">سررسید</div>
            <div className="mt-1 font-medium">
              {invoice.dueDate ? <JalaliDate date={invoice.dueDate} /> : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">آیتم‌های فاکتور</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-right font-medium">شرح</th>
                    <th className="p-3 text-right font-medium">تعداد</th>
                    <th className="p-3 text-right font-medium">قیمت واحد</th>
                    <th className="p-3 text-right font-medium">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3">{Number(item.quantity)}</td>
                      <td className="p-3">{formatCurrency(Number(item.unitPrice))}</td>
                      <td className="p-3">{formatCurrency(Number(item.lineTotal))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/30">
                    <td colSpan={3} className="p-3 text-left font-medium">
                      جمع کل
                    </td>
                    <td className="p-3 font-semibold">
                      {formatCurrency(Number(invoice.total))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">پرداخت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoice.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">پرداختی ثبت نشده.</p>
            ) : (
              invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="ky-list-row p-3"
                >
                  <div>
                    <div className="font-medium">
                      {formatCurrency(Number(payment.amount))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                      {' · '}
                      <JalaliDate date={payment.paidAt} />
                    </div>
                  </div>
                  <Badge variant="success">تکمیل‌شده</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {invoice.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">یادداشت</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{invoice.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <EntityFilesPanel entityType="INVOICE" entityId={invoice.id} files={fileRows} />
    </div>
  );
}
