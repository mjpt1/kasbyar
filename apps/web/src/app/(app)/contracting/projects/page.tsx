import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listContractProjects } from '@/server/packs/contracting/contracting.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'برنامه‌ریزی',
  ACTIVE: 'فعال',
  ON_HOLD: 'متوقف',
  DONE: 'تمام‌شده',
  CANCELLED: 'لغو شده',
};

export default async function ContractingProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('CONTRACTING');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listContractProjects(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="پروژه‌ها" description={`${total} پروژه`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">پروژه‌ای ثبت نشده است.</p>
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
                  {item.siteAddress ? ` — ${item.siteAddress}` : ''}
                </div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">{PROJECT_STATUS_LABELS[item.status] ?? item.status}</Badge>
                {item.contractAmount ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(Number(item.contractAmount))}
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
