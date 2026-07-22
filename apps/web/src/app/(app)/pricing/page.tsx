import Link from 'next/link';

import { PricingPlansGrid } from '@/components/billing/pricing-plans-grid';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { requireSession } from '@/lib/auth/session';
import type { MembershipRole } from '@prisma/client';
import { getSubscriptionSummary } from '@/server/billing/entitlement.service';

export default async function PricingPage() {
  const session = await requireSession();
  const summary = await getSubscriptionSummary(session.organizationId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="طرح‌ها و قیمت‌گذاری"
        description="مقایسه طرح‌ها و انتخاب مناسب کسب‌وکار شما — پرداخت آنلاین به‌زودی"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/settings/billing">وضعیت اشتراک</Link>
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground">
        طرح فعلی workspace شما: <strong>{summary.planName}</strong>
        {summary.isTrialing ? ' (دوره آزمایشی)' : ''}
      </p>

      <PricingPlansGrid
        currentPlanCode={summary.planCode}
        role={session.role as MembershipRole}
      />

      <p className="text-center text-xs text-muted-foreground">
        تغییر طرح بلافاصله در فضای کاری شما اعمال می‌شود. پرداخت آنلاین طرح‌ها به‌زودی
        از طریق درگاه پرداخت فعال می‌شود.
      </p>
    </div>
  );
}
