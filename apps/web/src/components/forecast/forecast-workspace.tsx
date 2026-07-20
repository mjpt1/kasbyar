'use client';

import { LineChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ForecastRow = {
  id: string;
  forecastType: string;
  value: number;
  confidence: number;
  factors?: Record<string, unknown>;
  entityId?: string | null;
};

type Grouped = {
  cashRunway: ForecastRow | null;
  revenue: ForecastRow | null;
  stockouts: ForecastRow[];
  churnRisks: ForecastRow[];
};

const TYPE_LABELS: Record<string, string> = {
  CASH_RUNWAY: 'نقدینگی (روز)',
  REVENUE: 'درآمد ۳۰ روز',
  STOCKOUT: 'ریسک اتمام موجودی',
  CHURN_RISK: 'ریسک ریزش',
};

export function ForecastWorkspace() {
  const [grouped, setGrouped] = useState<Grouped | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/forecast?grouped=1');
      const data = await res.json();
      if (data.success) setGrouped(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function compute() {
    setLoading(true);
    try {
      const res = await fetch('/api/forecast', { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'محاسبه ناموفق بود');
        return;
      }
      toast.success('پیش‌بینی‌ها به‌روز شد');
      await load();
    } catch {
      toast.error('خطا در ارتباط با سرور');
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="پیش‌بینی"
        description="نقدینگی، موجودی، ریزش مشتری و درآمد"
        actions={
          <>
            <HelpLink section="forecast" />
            <Button onClick={() => void compute()} disabled={loading}>
              {loading ? 'در حال محاسبه...' : 'محاسبه مجدد'}
            </Button>
          </>
        }
      />

      {!grouped || (!grouped.cashRunway && grouped.stockouts.length === 0) ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-sm">
            <LineChart className="size-8" />
            هنوز پیش‌بینی‌ای موجود نیست — دکمه محاسبه مجدد را بزنید.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{TYPE_LABELS.CASH_RUNWAY}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {grouped.cashRunway ? Math.round(grouped.cashRunway.value) : '—'}
                </p>
                <p className="text-muted-foreground text-xs">
                  اطمینان:{' '}
                  {grouped.cashRunway
                    ? `${Math.round(grouped.cashRunway.confidence * 100)}٪`
                    : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{TYPE_LABELS.REVENUE}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {grouped.revenue
                    ? Number(grouped.revenue.value).toLocaleString('fa-IR')
                    : '—'}
                </p>
                <p className="text-muted-foreground text-xs">ریال (افق ۳۰ روز)</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ریسک اتمام موجودی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped.stockouts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">موردی نیست</p>
                ) : (
                  grouped.stockouts.map((s) => (
                    <div key={s.id} className="text-sm">
                      <p className="font-medium">
                        {(s.factors as { name?: string })?.name ?? 'کالا'} — {Math.round(s.value)} روز
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ریسک ریزش مشتری</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped.churnRisks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">موردی نیست</p>
                ) : (
                  grouped.churnRisks.map((c) => (
                    <div key={c.id} className="text-sm">
                      <p className="font-medium">
                        {(c.factors as { name?: string })?.name ?? 'مشتری'} —{' '}
                        {Math.round(c.value)}٪
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
