import { Suspense } from 'react';
import { Users } from 'lucide-react';

import { CustomersCreateForm } from '@/components/features/customers/customers-create-form';
import { CustomersTable } from '@/components/features/customers/customers-table';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListPagination } from '@/components/shared/list-pagination';
import { ListSearch } from '@/components/shared/list-search';
import { LoadingState } from '@/components/shared/loading-state';
import { requireSession } from '@/lib/auth/session';
import { listCustomers } from '@/server/customers/customer.service';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const search = params.search;
  const page = Number(params.page ?? 1);

  const { items, total, totalPages } = await listCustomers(session.organizationId, {
    search,
    page,
    pageSize: 20,
  });

  const rows = items.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    city: customer.city,
    invoiceCount: customer._count.invoices,
    createdAt: customer.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="مشتریان" description={`${total} مشتری ثبت‌شده`} />
      <Suspense fallback={<LoadingState label="در حال آماده‌سازی جستجو…" className="py-4" />}>
        <ListSearch placeholder="جستجو بر اساس نام، تلفن یا ایمیل..." />
      </Suspense>
      <div id="create-customer">
        <CustomersCreateForm />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'نتیجه‌ای یافت نشد' : 'هنوز مشتری ثبت نشده'}
          description={
            search
              ? 'عبارت جستجو را تغییر دهید یا مشتری جدید اضافه کنید.'
              : 'اولین مشتری خود را اضافه کنید تا فاکتور و پرداخت ثبت کنید.'
          }
          actionLabel={search ? undefined : 'افزودن مشتری'}
          actionHref={search ? undefined : '#create-customer'}
        />
      ) : (
        <>
          <CustomersTable data={rows} />
          <ListPagination
            page={page}
            totalPages={totalPages}
            basePath="/customers"
            searchParams={{ search }}
          />
        </>
      )}
    </div>
  );
}
