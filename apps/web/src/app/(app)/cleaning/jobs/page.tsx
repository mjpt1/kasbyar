import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listCleaningJobs } from '@/server/packs/cleaning/cleaning.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const BOOKING_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'زمان‌بندی',
  CONFIRMED: 'تأیید‌شده',
  COMPLETED: 'انجام‌شده',
  CANCELLED: 'لغو شده',
  NO_SHOW: 'عدم حضور',
};

export default async function CleaningJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('CLEANING');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listCleaningJobs(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="سفارش‌ها" description={`${total} سفارش`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">سفارشی ثبت نشده است.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/customers/${item.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{item.address}</div>
                <div className="text-sm text-muted-foreground">
                  {item.customer.name}
                  {item.serviceType ? ` — ${item.serviceType}` : ''}
                </div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">{BOOKING_STATUS_LABELS[item.status] ?? item.status}</Badge>
                <div className="mt-1 text-sm">
                  <JalaliDate date={item.scheduledAt} />
                </div>
                {item.price ? (
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(Number(item.price))}
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
