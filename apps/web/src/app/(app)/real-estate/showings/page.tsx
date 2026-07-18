import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { listPropertyShowings } from '@/server/packs/real-estate/real-estate.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function RealEstateShowingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('REAL_ESTATE');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listPropertyShowings(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="بازدیدها" description={`${total} بازدید`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">بازدیدی ثبت نشده است.</p>
        ) : (
          items.map((showing) => (
            <Link
              key={showing.id}
              href={`/customers/${showing.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{showing.listing.title}</div>
                <div className="text-sm text-muted-foreground">
                  {showing.customer.name}
                  {showing.listing.address ? ` — ${showing.listing.address}` : ''}
                </div>
              </div>
              <div className="text-left text-sm">
                <JalaliDate date={showing.scheduledAt} showTime />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
