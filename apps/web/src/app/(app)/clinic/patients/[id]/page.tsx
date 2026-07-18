import Link from 'next/link';
import { notFound } from 'next/navigation';

import { VisitCreateForm } from '@/components/features/clinic/visit-create-form';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { AppointmentStatusBadge } from '@/components/shared/status-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPatientFile } from '@/server/packs/clinic/clinic.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function ClinicPatientFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session } = await requirePackPage('CLINIC');
  const { id } = await params;

  const file = await getPatientFile(session.organizationId, id);
  if (!file) notFound();

  const { customer, patientProfile, visits, appointments } = file;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.phone ?? 'پرونده بیمار'}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/clinic/appointments">نوبت‌ها</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">شماره پرونده</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">
            {patientProfile?.fileNumber ?? '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">حساسیت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{patientProfile?.allergies ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">یادداشت</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{patientProfile?.notes ?? '—'}</CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ویزیت‌ها</h2>
          <VisitCreateForm
            organizationId={session.organizationId}
            defaultCustomerId={customer.id}
          />
        </div>
        {visits.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز ویزیتی ثبت نشده است.</p>
        ) : (
          visits.map((visit) => (
            <div
              key={visit.id}
              className="flex items-center justify-between rounded-md border bg-card p-4"
            >
              <div>
                <div className="font-medium">{visit.chiefComplaint ?? 'ویزیت'}</div>
                <div className="text-sm text-muted-foreground">
                  {visit.diagnosis ?? 'بدون تشخیص'}
                  {visit.practitioner ? ` — ${visit.practitioner.name}` : ''}
                </div>
              </div>
              <div className="text-sm">
                <JalaliDate date={visit.visitDate} showTime />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">نوبت‌های اخیر</h2>
          <Button asChild variant="link" size="sm">
            <Link href="/clinic/appointments">مشاهده همه</Link>
          </Button>
        </div>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">نوبتی ثبت نشده است.</p>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between rounded-md border bg-card p-4"
            >
              <div>
                <div className="font-medium">{appt.reason ?? 'نوبت'}</div>
                <div className="text-sm text-muted-foreground">
                  {appt.practitioner ? appt.practitioner.name : '—'}
                </div>
              </div>
              <div className="text-left">
                <AppointmentStatusBadge status={appt.status} />
                <div className="mt-1 text-sm">
                  <JalaliDate date={appt.scheduledAt} showTime />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
