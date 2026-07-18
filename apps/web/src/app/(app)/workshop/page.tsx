import Link from 'next/link';
import { ClipboardList, Wrench } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getWorkshopDashboardSignals,
  listOpenRepairJobs,
} from '@/server/packs/workshop/workshop.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const REPAIR_JOB_LABELS: Record<string, string> = {
  INTAKE: 'پذیرش',
  DIAGNOSING: 'عیب‌یابی',
  WAITING_PARTS: 'انتظار قطعه',
  IN_PROGRESS: 'در حال تعمیر',
  READY: 'آماده تحویل',
  DELIVERED: 'تحویل‌شده',
  CANCELLED: 'لغو شده',
};

export default async function WorkshopHomePage() {
  const { session } = await requirePackPage('WORKSHOP');
  const [signals, openJobs] = await Promise.all([
    getWorkshopDashboardSignals(session.organizationId),
    listOpenRepairJobs(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="تعمیرگاه"
        description="پذیرش دستگاه، وضعیت تعمیر و تحویل"
        actions={
          <Button asChild size="sm">
            <Link href="/workshop/jobs">
              <ClipboardList className="ms-2 h-4 w-4" />
              همه پذیرش‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">پذیرش باز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.openCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">آماده تحویل</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{signals.readyCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">در حال تعمیر</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.inProgressCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            پذیرش‌های باز
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">پذیرش بازی ثبت نشده است.</p>
          ) : (
            openJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{job.deviceLabel}</div>
                  <div className="text-sm text-muted-foreground">
                    {job.customer.name} — {job.issue}
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{REPAIR_JOB_LABELS[job.status] ?? job.status}</Badge>
                  <div className="mt-1 text-sm">
                    <JalaliDate date={job.intakeAt} />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
