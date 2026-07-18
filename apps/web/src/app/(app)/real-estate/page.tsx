import Link from 'next/link';
import { Building2, Calendar, Home } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getRealEstateDashboardSignals,
  listUpcomingShowings,
} from '@/server/packs/real-estate/real-estate.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function RealEstateHomePage() {
  const { session } = await requirePackPage('REAL_ESTATE');
  const [signals, upcomingShowings] = await Promise.all([
    getRealEstateDashboardSignals(session.organizationId),
    listUpcomingShowings(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="املاک"
        description="فایل ملک، بازدید و وضعیت معامله"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/real-estate/listings">
                <Home className="ms-2 h-4 w-4" />
                فایل‌ها
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/real-estate/showings">
                <Calendar className="ms-2 h-4 w-4" />
                بازدیدها
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">فایل موجود</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.availableCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">رزرو شده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.reservedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">بازدید ۷ روز آینده</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.upcomingShowingCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            بازدیدهای پیشِ رو
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingShowings.length === 0 ? (
            <p className="text-sm text-muted-foreground">بازدیدی در ۷ روز آینده ثبت نشده است.</p>
          ) : (
            upcomingShowings.map((showing) => (
              <div key={showing.id} className="ky-list-row p-3">
                <div>
                  <div className="font-medium">{showing.listing.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {showing.customer.name}
                    {showing.listing.address ? ` — ${showing.listing.address}` : ''}
                  </div>
                </div>
                <div className="text-left text-sm">
                  <JalaliDate date={showing.scheduledAt} showTime />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
