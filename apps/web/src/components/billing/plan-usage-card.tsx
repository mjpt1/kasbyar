import {
  PLAN_QUOTA_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  getPlanDefinition,
  isUnlimitedQuota,
} from '@kesbyar/shared';
import Link from 'next/link';

import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSubscriptionSummary } from '@/server/billing/entitlement.service';

export async function PlanUsageCard({ organizationId }: { organizationId: string }) {
  const summary = await getSubscriptionSummary(organizationId);
  const plan = getPlanDefinition(summary.planCode);

  const quotaRows: Array<{
    key: keyof typeof summary.usage;
    label: string;
    current: number;
    limit: number;
  }> = [
    {
      key: 'customers',
      label: PLAN_QUOTA_LABELS.customers ?? 'مشتریان',
      current: summary.usage.customers,
      limit: plan.quotas.customers,
    },
    {
      key: 'leads',
      label: PLAN_QUOTA_LABELS.leads ?? 'لیدها',
      current: summary.usage.leads,
      limit: plan.quotas.leads,
    },
    {
      key: 'members',
      label: PLAN_QUOTA_LABELS.members ?? 'اعضا',
      current: summary.usage.members,
      limit: plan.quotas.members,
    },
    {
      key: 'invoicesThisMonth',
      label: PLAN_QUOTA_LABELS.invoicesPerMonth ?? 'فاکتور ماه',
      current: summary.usage.invoicesThisMonth,
      limit: plan.quotas.invoicesPerMonth,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">طرح فعلی: {summary.planName}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={summary.isTrialing ? 'secondary' : 'default'}>
              {SUBSCRIPTION_STATUS_LABELS[summary.status] ?? summary.status}
            </Badge>
            {summary.isTrialing && summary.trialEndsAt ? (
              <span className="text-xs text-muted-foreground">
                پایان آزمایش: <JalaliDate date={summary.trialEndsAt} />
              </span>
            ) : null}
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/pricing">مقایسه طرح‌ها</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {quotaRows.map((row) => {
          const unlimited = isUnlimitedQuota(row.limit);
          const pct = unlimited ? 0 : Math.min(100, Math.round((row.current / row.limit) * 100));
          return (
            <div key={row.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{row.label}</span>
                <span className="text-muted-foreground">
                  {row.current}
                  {!unlimited ? ` / ${row.limit}` : ' / نامحدود'}
                </span>
              </div>
              {!unlimited ? (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
