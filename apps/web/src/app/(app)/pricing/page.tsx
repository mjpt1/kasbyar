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
        description="مقایسه طرح‌ها — پرداخت آنلاین با درگاه پلتفرم در صورت پیکربندی"
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
        طرح‌های پولی: در صورت پیکربندی درگاه (BILLING_* در Vercel) به صفحه پرداخت هدایت می‌شوید.
        در غیر این صورت تغییر طرح بلافاصله اعمال می‌شود.
      </p>
    </div>
  );
}
