import Link from 'next/link';
import { ClipboardList, UtensilsCrossed } from 'lucide-react';
import { formatCurrency, getPackDashboardSurface } from '@kesbyar/shared';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getFoodDashboardSignals,
  listRecentFoodOrders,
} from '@/server/packs/food/food.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const FOOD_ORDER_LABELS: Record<string, string> = {
  OPEN: 'باز',
  PREPARING: 'در حال آماده‌سازی',
  READY: 'آماده',
  SERVED: 'سرو شده',
  CANCELLED: 'لغو شده',
};

export default async function FoodHomePage() {
  const { session } = await requirePackPage('FOOD_SERVICE');
  const surface = getPackDashboardSurface('FOOD_SERVICE', session.industrySpecialty);
  const [signals, recentOrders] = await Promise.all([
    getFoodDashboardSignals(session.organizationId),
    listRecentFoodOrders(session.organizationId),
  ]);

  return (
    <div className="ky-pack-panel space-y-6">
      <PageHeader
        title={surface.titleFa}
        description={surface.descriptionFa}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/food/menu">
                <UtensilsCrossed className="ms-2 h-4 w-4" />
                منو
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={surface.primaryCta?.href ?? '/food/orders'}>
                <ClipboardList className="ms-2 h-4 w-4" />
                {surface.primaryCta?.labelFa ?? 'سفارش‌ها'}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="ky-pack-shell">
        <div className="ky-pack-stats">
          <Card className="ky-pack-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">سفارش باز</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-amber-600">
              {signals.openCount}
            </CardContent>
          </Card>
          <Card className="ky-pack-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">سفارش امروز</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{signals.todayCount}</CardContent>
          </Card>
          <Card className="ky-pack-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">آیتم منو</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{signals.menuCount}</CardContent>
          </Card>
        </div>

        <Card className="ky-pack-hero">
          <CardHeader>
            <CardTitle className="text-base">برد سفارش‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">سفارشی ثبت نشده است.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="ky-list-row p-3">
                  <div>
                    <div className="font-medium">
                      {order.tableLabel ?? order.customer?.name ?? 'سفارش سالن'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.itemsSummary ?? formatCurrency(Number(order.totalAmount))}
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant="secondary">
                      {FOOD_ORDER_LABELS[order.status] ?? order.status}
                    </Badge>
                    <div className="mt-1 text-sm">
                      <JalaliDate date={order.orderedAt} showTime />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
