import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import {
  formatCurrency,
  getPackDefinition,
  wave4JobsHref,
  wave4ListLabel,
  type IndustryPackId,
  type Wave4PackId,
} from '@kesbyar/shared';

import { PageHeader } from '@/components/layout/page-header';
import { PackDashboardCharts } from '@/components/dashboard/pack-dashboard-charts';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPackWorkItemDashboardSignals,
  listOpenPackWorkItems,
  listPackWorkItems,
} from '@/server/packs/work-items/work-item.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'برنامه‌ریزی',
  ACTIVE: 'فعال',
  ON_HOLD: 'متوقف',
  DONE: 'تمام‌شده',
  CANCELLED: 'لغو شده',
};

export async function Wave4PackHomePage({ pack }: { pack: Wave4PackId }) {
  const { session } = await requirePackPage(pack);
  const def = getPackDefinition(pack);
  const [signals, items] = await Promise.all([
    getPackWorkItemDashboardSignals(session.organizationId, pack),
    listOpenPackWorkItems(session.organizationId, pack),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={def.label}
        description={def.description}
        actions={
          <Button asChild size="sm">
            <Link href={wave4JobsHref(pack)}>
              <ClipboardList className="ms-2 h-4 w-4" />
              {wave4ListLabel(pack)}
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
          <CardContent className="text-2xl font-bold text-amber-600">
            {signals.plannedCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">سررسید ۷ روز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.dueSoonCount}</CardContent>
        </Card>
      </div>

      <PackDashboardCharts
        organizationId={session.organizationId}
        packId={pack}
        specialtyId={session.industrySpecialty}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">موارد باز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">موردی ثبت نشده است.</p>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/customers/${item.customer.id}`}
                className="ky-list-row bg-muted/30 p-3 hover:bg-muted/50"
              >
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.customer.name}</div>
                </div>
                <div className="text-left space-y-1">
                  <Badge variant="secondary">
                    {PROJECT_STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                  {item.dueAt ? (
                    <div className="text-xs text-muted-foreground">
                      <JalaliDate date={item.dueAt} />
                    </div>
                  ) : null}
                  {item.amount != null ? (
                    <div className="text-xs">{formatCurrency(Number(item.amount))}</div>
                  ) : null}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export async function Wave4PackJobsPage({
  pack,
  searchParams,
}: {
  pack: Wave4PackId;
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage(pack);
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const { items, total } = await listPackWorkItems(session.organizationId, pack, { page });
  const def = getPackDefinition(pack as IndustryPackId);

  return (
    <div className="space-y-6">
      <PageHeader title={wave4ListLabel(pack)} description={`${total} مورد · ${def.label}`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">موردی ثبت نشده است.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/customers/${item.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">
                  {item.customer.name}
                  {item.location ? ` — ${item.location}` : ''}
                </div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">
                  {PROJECT_STATUS_LABELS[item.status] ?? item.status}
                </Badge>
                {item.amount != null ? (
                  <div className="mt-1 text-sm">{formatCurrency(Number(item.amount))}</div>
                ) : null}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
