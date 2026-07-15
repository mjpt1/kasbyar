import Link from 'next/link';

import { PlanUsageCard } from '@/components/billing/plan-usage-card';
import { PricingPlansGrid } from '@/components/billing/pricing-plans-grid';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { canManageBilling } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';
import { getPlanDefinition } from '@kesbyar/shared';
import { getSubscriptionSummary } from '@/server/billing/entitlement.service';
import { listSubscriptionEvents } from '@/server/billing/subscription.service';

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; suggested?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const canManage = canManageBilling(session.role as MembershipRole);
  const summary = await getSubscriptionSummary(session.organizationId);
  const events = canManage
    ? await listSubscriptionEvents(session.organizationId)
    : [];

  const suggestedPlan = params.suggested;
  const suggestedName = suggestedPlan ? getPlanDefinition(suggestedPlan).name : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="اشتراک و صورتحساب"
        description="طرح فعلی، میزان استفاده و تاریخچه تغییرات"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/pricing">مقایسه طرح‌ها</Link>
          </Button>
        }
      />

      {!canManage ? (
        <p className="text-sm text-muted-foreground">
          مشاهده کامل اشتراک و تغییر طرح فقط برای مدیران و بالاتر مجاز است.
        </p>
      ) : null}

      {params.upgrade ? (
        <UpgradePrompt
          message={
            params.upgrade === 'pack'
              ? `برای استفاده از ماژول عمودی، طرح خود را به ${suggestedName ?? 'استارتر'} یا بالاتر ارتقا دهید.`
              : 'برای دسترسی به این قابلیت، طرح خود را ارتقا دهید.'
          }
          suggestedPlan={suggestedPlan}
        />
      ) : null}

      <PlanUsageCard organizationId={session.organizationId} />

      {canManage ? (
        <>
          <div>
            <h2 className="mb-4 text-lg font-semibold">تغییر طرح</h2>
            <PricingPlansGrid
              currentPlanCode={summary.planCode}
              role={session.role as MembershipRole}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">تاریخچه اشتراک</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {events.length === 0 ? (
                <p className="text-muted-foreground">رویدادی ثبت نشده است.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex justify-between border-b py-2 last:border-0">
                    <span>
                      {ev.action}
                      {ev.fromPlanCode && ev.toPlanCode
                        ? ` (${ev.fromPlanCode} → ${ev.toPlanCode})`
                        : ''}
                    </span>
                    <span className="text-muted-foreground">
                      <JalaliDate date={ev.createdAt} showTime />
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
