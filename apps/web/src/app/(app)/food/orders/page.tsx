import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listFoodOrders } from '@/server/packs/food/food.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const FOOD_ORDER_LABELS: Record<string, string> = {
  OPEN: 'باز',
  PREPARING: 'در حال آماده‌سازی',
  READY: 'آماده',
  SERVED: 'سرو شده',
  CANCELLED: 'لغو شده',
};

export default async function FoodOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('FOOD_SERVICE');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listFoodOrders(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="سفارش‌ها" description={`${total} سفارش ثبت‌شده`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نشده است.</p>
        ) : (
          items.map((order) => (
            <div
              key={order.id}
              className="ky-list-row bg-card p-4"
            >
              <div>
                <div className="font-medium">
                  {order.tableLabel ?? order.customer?.name ?? 'سفارش سالن'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.itemsSummary ?? '—'}
                </div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">{FOOD_ORDER_LABELS[order.status] ?? order.status}</Badge>
                <div className="mt-1 text-sm">
                  <JalaliDate date={order.orderedAt} showTime />
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(Number(order.totalAmount))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
