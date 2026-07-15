import Link from 'next/link';
import { Boxes, Package } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRetailDashboardSignals } from '@/server/packs/retail/retail.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function RetailHomePage() {
  const { session } = await requirePackPage('RETAIL');
  const signals = await getRetailDashboardSignals(session.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="فروشگاه"
        description="محصولات و موجودی"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/retail/products">
                <Package className="ms-2 h-4 w-4" />
                محصولات
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/retail/inventory">
                <Boxes className="ms-2 h-4 w-4" />
                موجودی
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">کم‌موجود</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.lowStockCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">گردش ۷ روز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.movementCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">محصول فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.activeProductCount}</CardContent>
        </Card>
      </div>
    </div>
  );
}
