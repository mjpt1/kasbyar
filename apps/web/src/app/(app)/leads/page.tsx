import { Suspense } from 'react';
import { Target } from 'lucide-react';

import { LeadsCreateForm } from '@/components/features/leads/leads-create-form';
import { LeadsTable } from '@/components/features/leads/leads-table';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ListPagination } from '@/components/shared/list-pagination';
import { ListSearch } from '@/components/shared/list-search';
import { LoadingState } from '@/components/shared/loading-state';
import { requireSession } from '@/lib/auth/session';
import { listLeads } from '@/server/leads/lead.service';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const search = params.search;
  const status = params.status;
  const page = Number(params.page ?? 1);

  const { items, total, totalPages } = await listLeads(session.organizationId, {
    search,
    status,
    page,
    pageSize: 20,
  });

  const rows = items.map((lead) => ({
    id: lead.id,
    title: lead.title,
    contactName: lead.contactName,
    contactPhone: lead.contactPhone,
    status: lead.status,
    stageName: lead.stage?.name ?? null,
    value: lead.value ? Number(lead.value) : null,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="لیدها" description={`${total} لید در pipeline`} />
      <Suspense fallback={<LoadingState label="در حال آماده‌سازی جستجو…" className="py-4" />}>
        <ListSearch placeholder="جستجو بر اساس عنوان یا تماس..." />
      </Suspense>
      <div id="create-lead">
        <LeadsCreateForm />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Target}
          title={search ? 'نتیجه‌ای یافت نشد' : 'هنوز لیدی ثبت نشده'}
          description={
            search
              ? 'عبارت جستجو را تغییر دهید یا لید جدید اضافه کنید.'
              : 'فرصت‌های فروش جدید را اینجا پیگیری کنید.'
          }
          actionLabel={search ? undefined : 'افزودن لید'}
          actionHref={search ? undefined : '#create-lead'}
        />
      ) : (
        <>
          <LeadsTable data={rows} />
          <ListPagination
            page={page}
            totalPages={totalPages}
            basePath="/leads"
            searchParams={{ search, status }}
          />
        </>
      )}
    </div>
  );
}
