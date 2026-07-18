import Link from 'next/link';
import { Calendar, HeartPulse } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { AppointmentStatusBadge } from '@/components/shared/status-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getClinicDashboardSignals,
  listTodayAppointments,
} from '@/server/packs/clinic/clinic.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function ClinicHomePage() {
  const { session } = await requirePackPage('CLINIC');
  const [signals, todayAppointments] = await Promise.all([
    getClinicDashboardSignals(session.organizationId),
    listTodayAppointments(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="کلینیک"
        description="نوبت‌دهی و پیگیری بیماران"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/clinic/patients">
                <HeartPulse className="ms-2 h-4 w-4" />
                بیماران
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/clinic/appointments">
                <Calendar className="ms-2 h-4 w-4" />
                نوبت‌ها
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">نوبت‌های امروز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.todayCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">از دست رفته</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.missedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">پیگیری درمان</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.followUpCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">بیماران</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.patientCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">برنامه امروز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">نوبتی برای امروز ثبت نشده است.</p>
          ) : (
            todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="ky-list-row p-3"
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
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
