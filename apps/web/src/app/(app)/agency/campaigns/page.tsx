import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listMarketingCampaigns } from '@/server/packs/agency/agency.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'برنامه‌ریزی',
  ACTIVE: 'فعال',
  ON_HOLD: 'متوقف',
  DONE: 'تمام‌شده',
  CANCELLED: 'لغو شده',
};

export default async function AgencyCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('MARKETING_AGENCY');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listMarketingCampaigns(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="کمپین‌ها" description={`${total} کمپین`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">کمپینی ثبت نشده است.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/customers/${item.customer.id}`}
              className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-muted/50"
            >
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
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
