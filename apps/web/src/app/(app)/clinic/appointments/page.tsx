import Link from 'next/link';

import { AppointmentsCreateForm } from '@/components/features/clinic/appointments-create-form';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { AppointmentStatusBadge } from '@/components/shared/status-badges';
import { listAppointments } from '@/server/packs/clinic/clinic.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function ClinicAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('CLINIC');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listAppointments(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="نوبت‌ها" description={`${total} نوبت ثبت‌شده`} />
      <AppointmentsCreateForm organizationId={session.organizationId} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز نوبتی ثبت نشده است.</p>
        ) : (
          items.map((appt) => (
            <Link
              key={appt.id}
              href={`/customers/${appt.customer.id}`}
              className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{appt.customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {appt.reason ?? 'ویزیت'}
                  {appt.practitioner ? ` — ${appt.practitioner.name}` : ''}
                </div>
              </div>
              <div className="text-left">
                <AppointmentStatusBadge status={appt.status} />
                <div className="mt-1 text-sm">
                  <JalaliDate date={appt.scheduledAt} showTime />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
