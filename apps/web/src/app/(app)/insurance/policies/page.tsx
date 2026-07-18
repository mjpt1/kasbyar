import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listInsurancePolicies } from '@/server/packs/insurance/insurance.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const POLICY_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'فعال',
  PENDING: 'در انتظار',
  EXPIRED: 'منقضی',
  CANCELLED: 'لغو شده',
};

export default async function InsurancePoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('INSURANCE_AGENCY');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listInsurancePolicies(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="بیمه‌نامه‌ها" description={`${total} بیمه‌نامه`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">بیمه‌نامه‌ای ثبت نشده است.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/customers/${item.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{item.policyNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {item.customer.name} — {item.policyType}
                </div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">{POLICY_STATUS_LABELS[item.status] ?? item.status}</Badge>
                {item.expiresAt ? (
                  <div className="mt-1 text-sm">
                    <JalaliDate date={item.expiresAt} />
                  </div>
                ) : null}
                {item.premium ? (
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(Number(item.premium))}
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
