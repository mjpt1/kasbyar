import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';
import { getPackDashboardSurface } from '@kesbyar/shared';

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
  const surface = getPackDashboardSurface('BEAUTY_SALON', session.industrySpecialty);
  const [signals, todayAppointments] = await Promise.all([
    getBeautyDashboardSignals(session.organizationId),
    listTodayBeautyAppointments(session.organizationId),
  ]);

  return (
    <div className="ky-pack-panel space-y-6">
      <PageHeader
        title={surface.titleFa}
        description={surface.descriptionFa}
        actions={
          <Button asChild size="sm">
            <Link href={surface.primaryCta?.href ?? '/beauty/appointments'}>
              <Calendar className="ms-2 h-4 w-4" />
              {surface.primaryCta?.labelFa ?? 'همه نوبت‌ها'}
            </Link>
          </Button>
        }
      />

      <div className="ky-pack-stats">
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">نوبت‌های امروز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.todayCount}</CardContent>
        </Card>
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">نوبت‌های باز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.openCount}</CardContent>
        </Card>
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">۷ روز آینده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.upcomingCount}</CardContent>
        </Card>
      </div>

      <Card className="ky-pack-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            برنامه امروز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">نوبتی برای امروز ثبت نشده است.</p>
          ) : (
            todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="ky-list-row rounded-[var(--radius)] border border-border/60 p-3"
                style={{ backgroundColor: 'hsl(var(--panel-soft) / 0.55)' }}
              >
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
