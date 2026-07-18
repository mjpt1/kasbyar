import Link from 'next/link';
import { ClipboardList, Scale } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getLawDashboardSignals,
  listOpenLegalCases,
} from '@/server/packs/law/law.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const CASE_STATUS_LABELS: Record<string, string> = {
  OPEN: 'باز',
  ACTIVE: 'فعال',
  WAITING: 'در انتظار',
  CLOSED: 'مختومه',
};

export default async function LawHomePage() {
  const { session } = await requirePackPage('LAW_FIRM');
  const [signals, openCases] = await Promise.all([
    getLawDashboardSignals(session.organizationId),
    listOpenLegalCases(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="دفتر حقوقی"
        description="پرونده، موکل و پیگیری جلسات"
        actions={
          <Button asChild size="sm">
            <Link href="/law/cases">
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
            <CardTitle className="text-sm text-muted-foreground">در انتظار</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.waitingCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4" />
            پرونده‌های باز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openCases.length === 0 ? (
            <p className="text-sm text-muted-foreground">پرونده بازی ثبت نشده است.</p>
          ) : (
            openCases.map((item) => (
              <div key={item.id} className="ky-list-row p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.customer.name}
                    {item.caseNumber ? ` — ${item.caseNumber}` : ''}
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{CASE_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  {item.nextHearingAt ? (
                    <div className="mt-1 text-sm">
                      <JalaliDate date={item.nextHearingAt} />
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
