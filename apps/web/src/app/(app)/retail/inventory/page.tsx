import { StockMovementForm } from '@/components/features/retail/stock-movement-form';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { StockMovementTypeBadge } from '@/components/shared/status-badges';
import { listRetailProducts, listStockMovements } from '@/server/packs/retail/retail.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function RetailInventoryPage() {
  const { session } = await requirePackPage('RETAIL');

  const [movements, products] = await Promise.all([
    listStockMovements(session.organizationId, { page: 1 }),
    listRetailProducts(session.organizationId, { page: 1, pageSize: 100 }),
  ]);

  const productOptions = products.items.map((p) => ({
    id: p.id,
    name: p.name,
    stockQty: Number(p.stockQty),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="موجودی" description="گردش و ثبت ورود/خروج" />
      <StockMovementForm products={productOptions} />

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">آخرین گردش‌ها</h2>
        {movements.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز گردش موجودی ثبت نشده.</p>
        ) : (
          movements.items.map((m) => (
            <div
              key={m.id}
              className="ky-list-row bg-card p-4"
            >
              <div>
                <div className="font-medium">{m.product.name}</div>
                <div className="text-sm text-muted-foreground">
                  {m.reason ?? '—'}
                  {m.reference ? ` · ${m.reference}` : ''}
                </div>
              </div>
              <div className="text-left">
                <StockMovementTypeBadge type={m.type} />
                <div className="mt-1 text-sm">
                  {Number(m.quantity)} · <JalaliDate date={m.createdAt} showTime />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
