import Link from 'next/link';
import { ClipboardList, Printer } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@kesbyar/shared';
import {
  getPrintingDashboardSignals,
  listOpenPrintOrders,
} from '@/server/packs/printing/printing.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'برنامه‌ریزی',
  ACTIVE: 'فعال',
  ON_HOLD: 'متوقف',
  DONE: 'تمام‌شده',
  CANCELLED: 'لغو شده',
};

export default async function PrintingHomePage() {
  const { session } = await requirePackPage('PRINTING');
  const [signals, orders] = await Promise.all([
    getPrintingDashboardSignals(session.organizationId),
    listOpenPrintOrders(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="چاپ و تبلیغات"
        description="سفارش چاپ، تیراژ و تحویل"
        actions={
          <Button asChild size="sm">
            <Link href="/printing/orders">
              <ClipboardList className="ms-2 h-4 w-4" />
              همه سفارش‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">برنامه‌ریزی</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.plannedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">سررسید ۷ روز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{signals.dueSoonCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Printer className="h-4 w-4" />
            سفارش‌های باز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">سفارشی ثبت نشده است.</p>
          ) : (
            orders.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.customer.name} — تیراژ {item.quantity}
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{PROJECT_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  {item.dueAt ? (
                    <div className="mt-1 text-sm">
                      <JalaliDate date={item.dueAt} />
                    </div>
                  ) : null}
                  {item.totalAmount ? (
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(Number(item.totalAmount))}
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
