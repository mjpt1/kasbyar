import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listRepairJobs } from '@/server/packs/workshop/workshop.service';
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

export default async function WorkshopJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('WORKSHOP');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listRepairJobs(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="پذیرش‌ها" description={`${total} پذیرش`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">پذیرشی ثبت نشده است.</p>
        ) : (
          items.map((job) => (
            <Link
              key={job.id}
              href={`/customers/${job.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
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
                {job.quotedAmount ? (
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(Number(job.quotedAmount))}
                  </div>
                ) : null}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
