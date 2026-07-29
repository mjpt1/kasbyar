'use client';

import { formatPlanPrice, listPublicPlans, PLAN_FEATURE_LABELS, PLAN_QUOTA_LABELS } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { canManageBilling } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';

const plans = listPublicPlans();

export function PricingPlansGrid({
  currentPlanCode,
  role,
  canChange = true,
}: {
  currentPlanCode?: string;
  role: MembershipRole;
  canChange?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingOnline, setBillingOnline] = useState(false);
  const mayChange = canChange && canManageBilling(role);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/billing/checkout');
        const data = await res.json();
        if (data.success) setBillingOnline(Boolean(data.data?.configured));
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function selectPlan(planCode: string) {
    if (!mayChange) {
      toast.error('تغییر طرح فقط برای مدیران و بالاتر مجاز است');
      return;
    }
    if (planCode === currentPlanCode) return;

    const plan = plans.find((p) => p.code === planCode);
    const isPaid = plan && plan.priceMonthlyIrr > 0;

    setLoading(planCode);
    try {
      if (isPaid && billingOnline) {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planCode, billingPeriod: 'MONTHLY' }),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error?.message ?? 'شروع پرداخت ناموفق بود');
          return;
        }
        if (data.data.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
          return;
        }
      }

      const res = await fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode, billingPeriod: 'MONTHLY' }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'تغییر طرح ناموفق بود');
        return;
      }
      toast.success(
        isPaid && !billingOnline
          ? 'طرح به‌روزرسانی شد (پرداخت آنلاین هنوز پیکربندی نشده)'
          : 'طرح با موفقیت به‌روزرسانی شد',
      );
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => {
        const isCurrent = plan.code === currentPlanCode;
        const features = Object.entries(plan.features)
          .filter(([, v]) => v)
          .map(([k]) => PLAN_FEATURE_LABELS[k] ?? k);

        return (
          <Card
            key={plan.code}
            className={
              plan.highlighted
                ? 'border-primary shadow-md'
                : isCurrent
                  ? 'border-primary/60'
                  : undefined
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {isCurrent ? <Badge>فعلی</Badge> : null}
                {plan.highlighted && !isCurrent ? (
                  <Badge variant="secondary">پیشنهادی</Badge>
                ) : null}
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-2 text-2xl font-bold">
                {formatPlanPrice(plan.priceMonthlyIrr)}
                {plan.priceMonthlyIrr > 0 ? (
                  <span className="text-sm font-normal text-muted-foreground"> / ماه</span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-1 text-sm text-muted-foreground">
                {features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
                <li>
                  ✓ تا {plan.quotas.customers} {PLAN_QUOTA_LABELS.customers}
                </li>
                <li>
                  ✓{' '}
                  {plan.packs.mode === 'all'
                    ? 'همه بسته‌های عمودی'
                    : plan.packs.mode === 'single'
                      ? 'یک بسته عمودی'
                      : 'فقط هسته مشترک'}
                </li>
              </ul>
              <Button
                className="w-full"
                variant={isCurrent ? 'outline' : 'default'}
                disabled={isCurrent || loading === plan.code || !mayChange}
                onClick={() => selectPlan(plan.code)}
              >
                {isCurrent
                  ? 'طرح فعلی'
                  : loading === plan.code
                    ? 'در حال ثبت...'
                    : plan.priceMonthlyIrr > 0 && billingOnline
                      ? 'خرید و پرداخت'
                      : 'انتخاب طرح'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
