import Link from 'next/link';
import { ClipboardList, HardHat } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@kesbyar/shared';
import {
  getContractingDashboardSignals,
  listOpenContractProjects,
} from '@/server/packs/contracting/contracting.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'برنامه‌ریزی',
  ACTIVE: 'فعال',
  ON_HOLD: 'متوقف',
  DONE: 'تمام‌شده',
  CANCELLED: 'لغو شده',
};

export default async function ContractingHomePage() {
  const { session } = await requirePackPage('CONTRACTING');
  const [signals, projects] = await Promise.all([
    getContractingDashboardSignals(session.organizationId),
    listOpenContractProjects(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="پیمانکاری"
        description="پروژه، صورت‌وضعیت و پیشرفت کار"
        actions={
          <Button asChild size="sm">
            <Link href="/contracting/projects">
              <ClipboardList className="ms-2 h-4 w-4" />
              همه پروژه‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">برنامه‌ریزی</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.plannedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">متوقف</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{signals.onHoldCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HardHat className="h-4 w-4" />
            پروژه‌های باز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">پروژه‌ای ثبت نشده است.</p>
          ) : (
            projects.map((item) => (
              <div key={item.id} className="ky-list-row p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.customer.name}
                    {item.siteAddress ? ` — ${item.siteAddress}` : ''}
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{PROJECT_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  {item.contractAmount ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(Number(item.contractAmount))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
