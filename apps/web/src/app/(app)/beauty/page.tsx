import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { AppointmentStatusBadge } from '@/components/shared/status-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getBeautyDashboardSignals,
  listTodayBeautyAppointments,
} from '@/server/packs/beauty/beauty.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function BeautyHomePage() {
  const { session } = await requirePackPage('BEAUTY_SALON');
  const [signals, todayAppointments] = await Promise.all([
    getBeautyDashboardSignals(session.organizationId),
    listTodayBeautyAppointments(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="سالن زیبایی"
        description="نوبت خدمات و مراجعان"
        actions={
          <Button asChild size="sm">
            <Link href="/beauty/appointments">
              <Calendar className="ms-2 h-4 w-4" />
              همه نوبت‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">نوبت‌های امروز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.todayCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">نوبت‌های باز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.openCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">۷ روز آینده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.upcomingCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            برنامه امروز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">نوبتی برای امروز ثبت نشده است.</p>
          ) : (
            todayAppointments.map((appt) => (
              <div key={appt.id} className="ky-list-row p-3">
                <div>
                  <div className="font-medium">{appt.customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {appt.serviceName}
                    {appt.stylistName ? ` — ${appt.stylistName}` : ''}
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
