'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SimRun = {
  id: string;
  scenario: string;
  variables: Record<string, number>;
  results: {
    projectedWeeklyRevenue?: number;
    revenueChangePct?: number;
    additionalMonthlyCost?: number;
    confidenceBand?: { low: number; high: number };
  };
  createdAt: string;
  status: string;
};

export function SimulationWorkspace() {
  const [scenario, setScenario] = useState('تغییر قیمت و تبلیغات');
  const [priceChangePct, setPriceChangePct] = useState('5');
  const [headcountDelta, setHeadcountDelta] = useState('0');
  const [adSpendChangePct, setAdSpendChangePct] = useState('10');
  const [runs, setRuns] = useState<SimRun[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch('/api/simulation');
    const data = await res.json();
    if (data.success) setRuns(data.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          variables: {
            priceChangePct: Number(priceChangePct) || 0,
            headcountDelta: Number(headcountDelta) || 0,
            adSpendChangePct: Number(adSpendChangePct) || 0,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'شبیه‌سازی ناموفق بود');
        return;
      }
      toast.success('شبیه‌سازی انجام شد');
      await load();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="شبیه‌سازی what-if"
        description="اثر قیمت، نیرو و بودجه تبلیغات"
        actions={<HelpLink section="simulation" />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">پارامترها</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>نام سناریو</Label>
            <Input value={scenario} onChange={(e) => setScenario(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>تغییر قیمت (%)</Label>
            <Input value={priceChangePct} onChange={(e) => setPriceChangePct(e.target.value)} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>تغییر نیرو (نفر)</Label>
            <Input value={headcountDelta} onChange={(e) => setHeadcountDelta(e.target.value)} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>تغییر بودجه تبلیغات (%)</Label>
            <Input
              value={adSpendChangePct}
              onChange={(e) => setAdSpendChangePct(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => void run()} disabled={loading}>
              {loading ? 'در حال اجرا...' : 'اجرای شبیه‌سازی'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {runs.map((runItem) => (
          <Card key={runItem.id}>
            <CardHeader>
              <CardTitle className="text-base">{runItem.scenario}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
              <p>
                درآمد هفتگی:{' '}
                <strong>
                  {(runItem.results.projectedWeeklyRevenue ?? 0).toLocaleString('fa-IR')}
                </strong>
              </p>
              <p>
                تغییر درآمد:{' '}
                <strong>{runItem.results.revenueChangePct ?? 0}٪</strong>
              </p>
              <p>
                هزینه ماهانه اضافه:{' '}
                <strong>
                  {(runItem.results.additionalMonthlyCost ?? 0).toLocaleString('fa-IR')}
                </strong>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
