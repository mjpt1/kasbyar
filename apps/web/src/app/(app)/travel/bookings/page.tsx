import Link from 'next/link';

import { BookingsCreateForm } from '@/components/features/travel/bookings-create-form';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { BookingStatusBadge } from '@/components/shared/status-badges';
import { formatCurrency } from '@kesbyar/shared';
import { listTravelBookings } from '@/server/packs/travel/travel.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function TravelBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('TRAVEL_AGENCY');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listTravelBookings(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="رزروها" description={`${total} رزرو ثبت‌شده`} />
      <BookingsCreateForm />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز رزروی ثبت نشده است.</p>
        ) : (
          items.map((booking) => (
            <Link
              key={booking.id}
              href={`/customers/${booking.customer.id}`}
              className="flex items-center justify-between rounded-md border bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{booking.title}</div>
                <div className="text-sm text-muted-foreground">
                  {booking.customer.name} — {booking.destination} ({booking.travelersCount} نفر)
                </div>
              </div>
              <div className="text-left">
                <BookingStatusBadge status={booking.status} />
                <div className="mt-1 text-sm">
                  <JalaliDate date={booking.departureDate} />
                </div>
                {booking.quotedAmount ? (
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(Number(booking.quotedAmount))}
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
