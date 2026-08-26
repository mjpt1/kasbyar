import Link from 'next/link';
import { Boxes, Package, Receipt, Users, Wallet } from 'lucide-react';
import { getPackDashboardSurface } from '@kesbyar/shared';

import { PageHeader } from '@/components/layout/page-header';
import { PackDashboardCharts } from '@/components/dashboard/pack-dashboard-charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRetailDashboardSignals } from '@/server/packs/retail/retail.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function RetailHomePage() {
  const { session } = await requirePackPage('RETAIL');
  const surface = getPackDashboardSurface('RETAIL', session.industrySpecialty);
  const signals = await getRetailDashboardSignals(session.organizationId);

  return (
    <div className="ky-pack-panel space-y-6">
      <PageHeader
        title={surface.titleFa}
        description={surface.descriptionFa}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/customers">
                <Users className="ms-2 h-4 w-4" />
                مشتریان
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/invoices">
                <Receipt className="ms-2 h-4 w-4" />
                فاکتورها
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/payments">
                <Wallet className="ms-2 h-4 w-4" />
                پرداخت‌ها
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/retail/products">
                <Package className="ms-2 h-4 w-4" />
                محصولات
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={surface.primaryCta?.href ?? '/retail/inventory'}>
                <Boxes className="ms-2 h-4 w-4" />
                {surface.primaryCta?.labelFa ?? 'موجودی'}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="ky-pack-stats">
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">کم‌موجود</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">
            {signals.lowStockCount}
          </CardContent>
        </Card>
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">گردش ۷ روز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.movementCount}</CardContent>
        </Card>
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">محصول فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.activeProductCount}</CardContent>
        </Card>
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">فاکتور</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium text-primary">
            <Link href="/invoices" className="hover:underline">
              ثبت سریع
            </Link>
          </CardContent>
        </Card>
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">پرداخت</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium text-primary">
            <Link href="/payments" className="hover:underline">
              صندوق
            </Link>
          </CardContent>
        </Card>
        <Card className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">مشتری</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium text-primary">
            <Link href="/customers" className="hover:underline">
              فهرست
            </Link>
          </CardContent>
        </Card>
      </div>

      <PackDashboardCharts
        organizationId={session.organizationId}
        packId="RETAIL"
        specialtyId={session.industrySpecialty}
      />
    </div>
  );
}
