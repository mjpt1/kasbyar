import Link from 'next/link';
import { Calendar, Camera } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@kesbyar/shared';
import {
  getPhotographyDashboardSignals,
  listUpcomingPhotoSessions,
} from '@/server/packs/photography/photography.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const BOOKING_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'زمان‌بندی',
  CONFIRMED: 'تأیید‌شده',
  COMPLETED: 'انجام‌شده',
  CANCELLED: 'لغو شده',
  NO_SHOW: 'عدم حضور',
};

export default async function PhotographyHomePage() {
  const { session } = await requirePackPage('PHOTOGRAPHY');
  const [signals, sessions] = await Promise.all([
    getPhotographyDashboardSignals(session.organizationId),
    listUpcomingPhotoSessions(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="آتلیه عکاسی"
        description="رزرو جلسه، پکیج و تحویل"
        actions={
          <Button asChild size="sm">
            <Link href="/photography/sessions">
              <Calendar className="ms-2 h-4 w-4" />
              همه جلسات
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
            <Camera className="h-4 w-4" />
            جلسات پیشِ رو
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">جلسه‌ای ثبت نشده است.</p>
          ) : (
            sessions.map((item) => (
              <div key={item.id} className="ky-list-row p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.customer.name}
                    {item.packageName ? ` — ${item.packageName}` : ''}
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
