import { formatCurrency } from '@kesbyar/shared';
import { Receipt } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { InvoicesCreateForm } from '@/components/features/invoices/invoices-create-form';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { ListPagination } from '@/components/shared/list-pagination';
import { ListSearch } from '@/components/shared/list-search';
import { LoadingState } from '@/components/shared/loading-state';
import { InvoiceStatusBadge } from '@/components/shared/status-badges';
import { Card, CardContent } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { getCatalog } from '@/server/catalog/catalog.service';
import { listCustomers } from '@/server/customers/customer.service';
import { listInvoices } from '@/server/invoices/invoice.service';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; status?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const search = params.search;
  const status = params.status;
  const page = Number(params.page ?? 1);

  const [{ items, total, totalPages }, customersResult, catalog] = await Promise.all([
    listInvoices(session.organizationId, { search, status, page, pageSize: 20 }),
    listCustomers(session.organizationId, { pageSize: 100 }),
    getCatalog(session.organizationId),
  ]);

  const customers = customersResult.items.map((c) => ({ id: c.id, name: c.name }));
  const products = catalog.products.map((p) => ({
    id: p.id,
    name: p.name,
    unitPrice: Number(p.unitPrice),
    unit: p.unit,
  }));
  const services = catalog.services.map((s) => ({
    id: s.id,
    name: s.name,
    unitPrice: Number(s.unitPrice),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="فاکتورها" description={`${total} فاکتور`} />

      <Suspense fallback={<LoadingState label="در حال آماده‌سازی جستجو…" className="py-4" />}>
        <ListSearch placeholder="جستجو بر اساس شماره یا نام مشتری..." />
      </Suspense>

      <div id="create-invoice">
        <InvoicesCreateForm customers={customers} products={products} services={services} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={search ? 'فاکتوری یافت نشد' : 'هنوز فاکتوری صادر نشده'}
          description={
            search
              ? 'عبارت جستجو را تغییر دهید یا فاکتور جدید صادر کنید.'
              : 'اولین فاکتور را برای مشتری خود صادر کنید.'
          }
          actionLabel={search ? undefined : 'صدور فاکتور'}
          actionHref={search ? undefined : '#create-invoice'}
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-right font-medium">شماره</th>
                      <th className="p-3 text-right font-medium">مشتری</th>
                      <th className="p-3 text-right font-medium">وضعیت</th>
                      <th className="p-3 text-right font-medium">مبلغ</th>
                      <th className="p-3 text-right font-medium">سررسید</th>
                      <th className="p-3 text-right font-medium">تاریخ صدور</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {invoice.number}
                          </Link>
                        </td>
                        <td className="p-3">{invoice.customer.name}</td>
                        <td className="p-3">
                          <InvoiceStatusBadge status={invoice.status} />
                        </td>
                        <td className="p-3">{formatCurrency(Number(invoice.total))}</td>
                        <td className="p-3 text-muted-foreground">
                          {invoice.dueDate ? <JalaliDate date={invoice.dueDate} /> : '—'}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <JalaliDate date={invoice.issueDate} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <ListPagination
            page={page}
            totalPages={totalPages}
            basePath="/invoices"
            searchParams={{ search, status }}
          />
        </>
      )}
    </div>
  );
}
