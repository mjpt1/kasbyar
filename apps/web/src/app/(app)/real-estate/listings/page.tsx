import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listPropertyListings } from '@/server/packs/real-estate/real-estate.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const LISTING_LABELS: Record<string, string> = {
  AVAILABLE: 'موجود',
  RESERVED: 'رزرو',
  SOLD: 'فروخته‌شده',
  RENTED: 'اجاره‌داده‌شده',
  WITHDRAWN: 'برداشت‌شده',
};

export default async function RealEstateListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('REAL_ESTATE');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listPropertyListings(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="فایل‌ها" description={`${total} فایل`} />

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">فایلی ثبت نشده است.</p>
        ) : (
          items.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center justify-between rounded-md border bg-card p-4"
            >
              <div>
                <div className="font-medium">{listing.title}</div>
                <div className="text-sm text-muted-foreground">
                  {listing.address ?? '—'}
                  {listing.bedrooms ? ` · ${listing.bedrooms} خواب` : ''}
                  {listing._count.showings > 0 ? ` · ${listing._count.showings} بازدید` : ''}
                </div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">{LISTING_LABELS[listing.status] ?? listing.status}</Badge>
                <div className="mt-1 text-sm">{formatCurrency(Number(listing.price))}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
