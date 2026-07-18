import Link from 'next/link';
import { ClipboardList, Megaphone } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@kesbyar/shared';
import {
  getAgencyDashboardSignals,
  listOpenMarketingCampaigns,
} from '@/server/packs/agency/agency.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'برنامه‌ریزی',
  ACTIVE: 'فعال',
  ON_HOLD: 'متوقف',
  DONE: 'تمام‌شده',
  CANCELLED: 'لغو شده',
};

export default async function AgencyHomePage() {
  const { session } = await requirePackPage('MARKETING_AGENCY');
  const [signals, campaigns] = await Promise.all([
    getAgencyDashboardSignals(session.organizationId),
    listOpenMarketingCampaigns(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="آژانس بازاریابی"
        description="کمپین، بودجه و تحویل پروژه"
        actions={
          <Button asChild size="sm">
            <Link href="/agency/campaigns">
              <ClipboardList className="ms-2 h-4 w-4" />
              همه کمپین‌ها
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
            <CardTitle className="text-sm text-muted-foreground">متوقف</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{signals.onHoldCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4" />
            کمپین‌های باز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">کمپینی ثبت نشده است.</p>
          ) : (
            campaigns.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.customer.name}
                    {item.channel ? ` — ${item.channel}` : ''}
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{PROJECT_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  {item.budget ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(Number(item.budget))}
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
