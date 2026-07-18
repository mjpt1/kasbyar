import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { listGymMemberships } from '@/server/packs/fitness/fitness.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const MEMBERSHIP_LABELS: Record<string, string> = {
  ACTIVE: 'فعال',
  EXPIRED: 'منقضی',
  PAUSED: 'تعلیق',
  CANCELLED: 'لغو شده',
};

export default async function FitnessMembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('FITNESS');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listGymMemberships(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="عضویت‌ها" description={`${total} عضویت`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">عضویتی ثبت نشده است.</p>
        ) : (
          items.map((membership) => (
            <Link
              key={membership.id}
              href={`/customers/${membership.customer.id}`}
              className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{membership.customer.name}</div>
                <div className="text-sm text-muted-foreground">{membership.planName}</div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">
                  {MEMBERSHIP_LABELS[membership.status] ?? membership.status}
                </Badge>
                <div className="mt-1 text-sm">
                  تا <JalaliDate date={membership.endsAt} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
