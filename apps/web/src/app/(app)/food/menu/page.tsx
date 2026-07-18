import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listMenuItems } from '@/server/packs/food/food.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function FoodMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('FOOD_SERVICE');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listMenuItems(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="منو" description={`${total} آیتم`} />

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">آیتمی در منو ثبت نشده است.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  {!item.isAvailable ? <Badge variant="outline">ناموجود</Badge> : null}
                </div>
                {item.category ? (
                  <div className="text-sm text-muted-foreground">{item.category}</div>
                ) : null}
              </div>
              <div className="text-left text-sm">{formatCurrency(Number(item.price))}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
