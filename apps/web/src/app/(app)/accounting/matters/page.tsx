import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { listAccountingMatters } from '@/server/packs/accounting/accounting.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const MATTER_STATUS_LABELS: Record<string, string> = {
  OPEN: 'باز',
  ACTIVE: 'فعال',
  WAITING: 'در انتظار',
  CLOSED: 'مختومه',
};

export default async function AccountingMattersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('ACCOUNTING_FIRM');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listAccountingMatters(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="پرونده‌ها" description={`${total} پرونده`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">پرونده‌ای ثبت نشده است.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/customers/${item.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.customer.name}</div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">{MATTER_STATUS_LABELS[item.status] ?? item.status}</Badge>
                {item.dueDate ? (
                  <div className="mt-1 text-sm">
                    <JalaliDate date={item.dueDate} />
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
