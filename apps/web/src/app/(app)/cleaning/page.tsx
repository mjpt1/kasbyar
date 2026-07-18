import Link from 'next/link';
import { ClipboardList, SprayCan } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@kesbyar/shared';
import {
  getCleaningDashboardSignals,
  listUpcomingCleaningJobs,
} from '@/server/packs/cleaning/cleaning.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const BOOKING_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'زمان‌بندی',
  CONFIRMED: 'تأیید‌شده',
  COMPLETED: 'انجام‌شده',
  CANCELLED: 'لغو شده',
  NO_SHOW: 'عدم حضور',
};

export default async function CleaningHomePage() {
  const { session } = await requirePackPage('CLEANING');
  const [signals, jobs] = await Promise.all([
    getCleaningDashboardSignals(session.organizationId),
    listUpcomingCleaningJobs(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="خدمات نظافتی"
        description="سفارش نظافت، زمان‌بندی و اعزام"
        actions={
          <Button asChild size="sm">
            <Link href="/cleaning/jobs">
              <ClipboardList className="ms-2 h-4 w-4" />
              همه سفارش‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">امروز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.todayCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">۷ روز آینده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.upcomingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">تأیید‌شده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{signals.confirmedCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SprayCan className="h-4 w-4" />
            سفارش‌های پیشِ رو
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">سفارشی ثبت نشده است.</p>
          ) : (
            jobs.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{item.address}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.customer.name}
                    {item.serviceType ? ` — ${item.serviceType}` : ''}
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{BOOKING_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  <div className="mt-1 text-sm">
                    <JalaliDate date={item.scheduledAt} />
                  </div>
                  {item.price ? (
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(Number(item.price))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
