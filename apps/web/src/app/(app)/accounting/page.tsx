import Link from 'next/link';
import { Calculator, ClipboardList } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAccountingDashboardSignals,
  listOpenAccountingMatters,
} from '@/server/packs/accounting/accounting.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const MATTER_STATUS_LABELS: Record<string, string> = {
  OPEN: 'باز',
  ACTIVE: 'فعال',
  WAITING: 'در انتظار',
  CLOSED: 'مختومه',
};

export default async function AccountingHomePage() {
  const { session } = await requirePackPage('ACCOUNTING_FIRM');
  const [signals, openMatters] = await Promise.all([
    getAccountingDashboardSignals(session.organizationId),
    listOpenAccountingMatters(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="دفتر حسابداری"
        description="پرونده مشتری، سررسید و خدمات دوره‌ای"
        actions={
          <Button asChild size="sm">
            <Link href="/accounting/matters">
              <ClipboardList className="ms-2 h-4 w-4" />
              همه پرونده‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">پرونده باز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.openCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{signals.activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">سررسید ۷ روز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.dueSoonCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4" />
            پرونده‌های باز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openMatters.length === 0 ? (
            <p className="text-sm text-muted-foreground">پرونده بازی ثبت نشده است.</p>
          ) : (
            openMatters.map((item) => (
              <div key={item.id} className="ky-list-row p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.customer.name}</div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{MATTER_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  {item.dueDate ? (
                    <div className="mt-1 text-sm">
                      <JalaliDate date={item.dueDate} />
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
