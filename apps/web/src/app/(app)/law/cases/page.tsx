import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { listLegalCases } from '@/server/packs/law/law.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const CASE_STATUS_LABELS: Record<string, string> = {
  OPEN: 'باز',
  ACTIVE: 'فعال',
  WAITING: 'در انتظار',
  CLOSED: 'مختومه',
};

export default async function LawCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('LAW_FIRM');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listLegalCases(session.organizationId, { page });

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
              className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">
                  {item.customer.name}
                  {item.caseNumber ? ` — ${item.caseNumber}` : ''}
                </div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">{CASE_STATUS_LABELS[item.status] ?? item.status}</Badge>
                {item.nextHearingAt ? (
                  <div className="mt-1 text-sm">
                    <JalaliDate date={item.nextHearingAt} />
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
