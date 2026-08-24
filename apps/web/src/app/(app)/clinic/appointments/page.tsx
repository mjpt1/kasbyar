import Link from 'next/link';

import { AppointmentCancelButton } from '@/components/features/appointments/appointment-cancel-button';
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
            <div key={appt.id} className="ky-list-row bg-card p-4">
              <Link href={`/customers/${appt.customer.id}`} className="min-w-0 flex-1 hover:opacity-90">
                <div className="font-medium">{appt.customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {appt.reason ?? 'ویزیت'}
                  {appt.practitioner ? ` — ${appt.practitioner.name}` : ''}
                </div>
              </Link>
              <div className="flex flex-col items-end gap-2 text-left">
                <AppointmentStatusBadge status={appt.status} />
                <div className="text-sm">
                  <JalaliDate date={appt.scheduledAt} showTime />
                </div>
                {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' ? (
                  <AppointmentCancelButton appointmentId={appt.id} pack="clinic" />
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
