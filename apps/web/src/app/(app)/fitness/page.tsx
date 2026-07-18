import Link from 'next/link';
import { BadgeCheck, Calendar, Dumbbell } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getFitnessDashboardSignals,
  listUpcomingGymClasses,
} from '@/server/packs/fitness/fitness.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function FitnessHomePage() {
  const { session } = await requirePackPage('FITNESS');
  const [signals, upcomingClasses] = await Promise.all([
    getFitnessDashboardSignals(session.organizationId),
    listUpcomingGymClasses(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="باشگاه"
        description="عضویت، انقضا و کلاس‌های گروهی"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/fitness/memberships">
                <BadgeCheck className="ms-2 h-4 w-4" />
                عضویت‌ها
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/fitness/classes">
                <Calendar className="ms-2 h-4 w-4" />
                کلاس‌ها
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">عضویت فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">انقضای ۳۰ روز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.expiringCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">کلاس ۷ روز آینده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.upcomingClassCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-4 w-4" />
            کلاس‌های پیشِ رو
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">کلاسی در ۷ روز آینده ثبت نشده است.</p>
          ) : (
            upcomingClasses.map((gymClass) => (
              <div key={gymClass.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{gymClass.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {gymClass.coach ? `${gymClass.coach} · ` : ''}
                    {gymClass.enrolledCount}/{gymClass.capacity} نفر
                  </div>
                </div>
                <div className="text-left text-sm">
                  <JalaliDate date={gymClass.scheduledAt} showTime />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
