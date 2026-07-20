'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Plan = {
  id: string;
  goal: string;
  plan: {
    source?: string;
    pillars?: Array<{ name: string; actions?: string[] }>;
    timeline?: Record<string, string>;
    kpis?: Array<{ name: string; value: number }>;
    llmNotes?: string;
  };
  createdAt: string;
};

export function StrategyWorkspace() {
  const [goal, setGoal] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch('/api/strategy');
    const data = await res.json();
    if (data.success) setPlans(data.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'تولید برنامه ناموفق بود');
        return;
      }
      toast.success('برنامه استراتژیک آماده شد');
      setGoal('');
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
        title="موتور استراتژی"
        description="هدف بگذارید و برنامه عملیاتی بگیرید"
        actions={<HelpLink section="strategy" />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">هدف جدید</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>هدف کسب‌وکار</Label>
            <Textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="مثلاً افزایش ۵۰٪ فروش در ۳ ماه"
            />
          </div>
          <Button onClick={() => void generate()} disabled={loading || goal.trim().length < 3}>
            {loading ? 'در حال تولید...' : 'تولید برنامه'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle className="text-base">{plan.goal}</CardTitle>
              <p className="text-muted-foreground text-xs">
                منبع: {plan.plan.source ?? 'heuristic'} ·{' '}
                {new Date(plan.createdAt).toLocaleString('fa-IR')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {(plan.plan.pillars ?? []).map((pillar) => (
                <div key={pillar.name}>
                  <p className="font-medium">{pillar.name}</p>
                  <ul className="text-muted-foreground list-disc pr-5">
                    {(pillar.actions ?? []).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {plan.plan.timeline ? (
                <div>
                  <p className="font-medium">جدول زمانی</p>
                  <ul className="text-muted-foreground list-disc pr-5">
                    {Object.entries(plan.plan.timeline).map(([k, v]) => (
                      <li key={k}>
                        {k}: {v}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {plan.plan.llmNotes ? (
                <p className="whitespace-pre-line rounded-md border p-3">{plan.plan.llmNotes}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
