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
import { ResponsiveTable } from '@/components/shared/responsive-table';
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
            <CardContent className="p-0 md:p-0">
              <div className="p-3 md:p-0">
                <ResponsiveTable
                  columns={[
                    { key: 'number', header: 'شماره' },
                    { key: 'customer', header: 'مشتری' },
                    { key: 'status', header: 'وضعیت' },
                    { key: 'total', header: 'مبلغ' },
                    { key: 'due', header: 'سررسید', hideOnMobile: true },
                    { key: 'issued', header: 'تاریخ صدور' },
                  ]}
                  rows={items.map((invoice) => ({
                    id: invoice.id,
                    cells: {
                      number: (
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {invoice.number}
                        </Link>
                      ),
                      customer: invoice.customer.name,
                      status: <InvoiceStatusBadge status={invoice.status} />,
                      total: formatCurrency(Number(invoice.total)),
                      due: invoice.dueDate ? <JalaliDate date={invoice.dueDate} /> : '—',
                      issued: <JalaliDate date={invoice.issueDate} />,
                    },
                  }))}
                />
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
