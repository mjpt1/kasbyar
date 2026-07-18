import Link from 'next/link';

import { VisitCreateForm } from '@/components/features/clinic/visit-create-form';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { EmptyState } from '@/components/shared/empty-state';
import { FolderOpen } from 'lucide-react';
import { listVisitRecords } from '@/server/packs/clinic/clinic.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function ClinicVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; customerId?: string }>;
}) {
  const { session } = await requirePackPage('CLINIC');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listVisitRecords(session.organizationId, {
    page,
    customerId: params.customerId,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="پرونده ویزیت" description={`${total} ویزیت ثبت‌شده`} />
      <VisitCreateForm organizationId={session.organizationId} />

      {items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="هنوز ویزیتی ثبت نشده"
          description="ویزیت جدید را ثبت کنید تا در پرونده بیمار نمایش داده شود."
        />
      ) : (
        <div className="space-y-3">
          {items.map((visit) => (
            <Link
              key={visit.id}
              href={`/clinic/patients/${visit.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{visit.customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {visit.chiefComplaint ?? 'ویزیت'}
                  {visit.practitioner ? ` — ${visit.practitioner.name}` : ''}
                </div>
              </div>
              <div className="text-left text-sm">
                <JalaliDate date={visit.visitDate} showTime />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
