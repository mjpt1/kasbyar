import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listRetailProducts } from '@/server/packs/retail/retail.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function RetailProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; lowStock?: string }>;
}) {
  const { session } = await requirePackPage('RETAIL');
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const lowStockOnly = params.lowStock === '1';

  const { items, total } = await listRetailProducts(session.organizationId, {
    page,
    lowStockOnly,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="محصولات"
        description={
          lowStockOnly ? `${total} محصول کم‌موجود` : `${total} محصول فعال`
        }
        actions={
          lowStockOnly ? (
            <Link href="/retail/products" className="text-sm text-primary hover:underline">
              نمایش همه
            </Link>
          ) : (
            <Link href="/retail/products?lowStock=1" className="text-sm text-primary hover:underline">
              فقط کم‌موجود
            </Link>
          )
        }
      />

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">محصولی یافت نشد.</p>
        ) : (
          items.map((product) => (
            <div
              key={product.id}
              className="ky-list-row bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{product.name}</span>
                  {product.isLowStock ? (
                    <Badge variant="destructive">کم‌موجود</Badge>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.sku ? `کد ${product.sku} · ` : ''}
                  موجودی: {Number(product.stockQty)} {product.unit}
                </div>
              </div>
              <div className="text-left text-sm">{formatCurrency(Number(product.unitPrice))}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
