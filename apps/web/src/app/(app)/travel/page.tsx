import Link from 'next/link';
import { Luggage, Plane } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { BookingStatusBadge } from '@/components/shared/status-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getTravelDashboardSignals,
  listUpcomingDepartures,
} from '@/server/packs/travel/travel.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function TravelHomePage() {
  const { session } = await requirePackPage('TRAVEL_AGENCY');
  const [signals, upcoming] = await Promise.all([
    getTravelDashboardSignals(session.organizationId),
    listUpcomingDepartures(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="مسافرتی"
        description="درخواست‌ها و برنامه اعزام"
        actions={
          <Button asChild size="sm">
            <Link href="/travel/bookings">
              <Luggage className="ms-2 h-4 w-4" />
              همه رزروها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">درخواست‌های باز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.pendingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">اعزام ۳۰ روز آینده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.upcomingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">مانده حساب</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.unpaidCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plane className="h-4 w-4" />
            اعزام‌های پیشِ رو
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">اعزامی در ۳۰ روز آینده ثبت نشده.</p>
          ) : (
            upcoming.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{booking.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.customer.name} — {booking.destination}
                  </div>
                </div>
                <div className="text-left">
                  <BookingStatusBadge status={booking.status} />
                  <div className="mt-1 text-sm">
                    <JalaliDate date={booking.departureDate} />
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
