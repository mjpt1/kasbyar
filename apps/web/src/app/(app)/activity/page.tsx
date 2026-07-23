import { Activity } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Card, CardContent } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { listActivities } from '@/server/reports/reports.service';

export default async function ActivityPage() {
  const session = await requireSession();
  const { items, total } = await listActivities(session.organizationId, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="فعالیت‌ها"
        description={`${total} رویداد ثبت‌شده`}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="فعالیتی ثبت نشده"
          description="با ثبت مشتری، سرنخ فروش، فاکتور و پرداخت، فعالیت‌ها اینجا نمایش داده می‌شوند."
        />
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {items.map((activity) => (
              <div key={activity.id} className="flex gap-4 p-4">
                <div className="flex-1">
                  <div className="font-medium">{activity.title}</div>
                  {activity.description ? (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {activity.description}
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {activity.user ? <span>{activity.user.name}</span> : null}
                    {activity.customer ? (
                      <Link
                        href={`/customers/${activity.customer.id}`}
                        className="text-primary hover:underline"
                      >
                        {activity.customer.name}
                      </Link>
                    ) : null}
                    {activity.lead ? (
                      <Link
                        href={`/leads/${activity.lead.id}`}
                        className="text-primary hover:underline"
                      >
                        {activity.lead.title}
                      </Link>
                    ) : null}
                    {activity.invoice ? (
                      <Link
                        href={`/invoices/${activity.invoice.id}`}
                        className="text-primary hover:underline"
                      >
                        {activity.invoice.number}
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  <JalaliDate date={activity.createdAt} showTime />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
