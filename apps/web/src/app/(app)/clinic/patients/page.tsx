import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { HeartPulse } from 'lucide-react';
import { listPatients } from '@/server/packs/clinic/clinic.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function ClinicPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { session } = await requirePackPage('CLINIC');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listPatients(session.organizationId, {
    search: params.search,
    page,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="بیماران" description={`${total} بیمار با پرونده فعال`} />

      {items.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="هنوز پرونده بیمار ثبت نشده"
          description="از بخش مشتریان، بیمار را انتخاب و پرونده کلینیک ایجاد کنید."
        />
      ) : (
        <div className="space-y-2">
          {items.map((patient) => (
            <Link
              key={patient.id}
              href={`/customers/${patient.id}`}
              className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-muted-foreground">
                  {patient.phone ?? '—'}
                  {patient.patientProfile?.fileNumber
                    ? ` · پرونده ${patient.patientProfile.fileNumber}`
                    : ''}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {patient._count.appointments} نوبت
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
