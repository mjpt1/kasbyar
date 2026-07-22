'use client';

import type { DailyBriefing } from '@kesbyar/shared';
import { AlertTriangle, CheckCircle2, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DIMENSION_LABELS: Record<string, string> = {
  FINANCIAL: 'سلامت مالی',
  SALES: 'سلامت فروش',
  OPERATIONS: 'سلامت عملیات',
  GROWTH: 'سلامت رشد',
  HR: 'سلامت منابع انسانی',
};

function alertIcon(level: string) {
  if (level === 'critical') return <AlertTriangle className="size-4 text-red-500" />;
  if (level === 'warning') return <AlertTriangle className="size-4 text-amber-500" />;
  return <CheckCircle2 className="size-4 text-emerald-500" />;
}

export function CommandCenterClient() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/briefing/daily', { method: 'POST' });
      const data = await res.json();
      if (data.success) setBriefing(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function confirmRecommendation(rec: DailyBriefing['recommendations'][number]) {
    if (!rec.payload || !rec.requiresConfirmation) return;
    const actionId = rec.id ?? `briefing-${Date.now()}`;
    setConfirmingId(actionId);
    try {
      const res = await fetch('/api/conversation/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId,
          approved: true,
          payload: { ...rec.payload, agentType: 'CEO' },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.data.message ?? 'اقدام انجام شد');
        setBriefing((prev) =>
          prev
            ? {
                ...prev,
                recommendations: prev.recommendations.filter((r) => r.id !== rec.id),
              }
            : prev,
        );
      } else {
        toast.error(data.error?.message ?? 'تأیید ناموفق بود');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setConfirmingId(null);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">در حال بارگذاری اتاق فرمان...</p>;
  }

  if (!briefing) {
    return <p className="text-muted-foreground text-sm">خطا در بارگذاری اتاق فرمان</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="اتاق فرمان"
        description="پایش لحظه‌ای وضعیت شرکت و اقدامات تأییدپذیر"
        actions={
          <>
            <HelpLink section="command" />
            <Button variant="outline" size="sm" onClick={() => void load()}>
              بروزرسانی
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="size-5" />
            {briefing.greeting}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-7">{briefing.summary}</p>
          {briefing.degraded ? (
            <p className="text-muted-foreground mt-2 text-xs">حالت پشتیبان فعال است</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {briefing.healthScores.map((score) => (
          <Card key={score.dimension}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {DIMENSION_LABELS[score.dimension] ?? score.dimension}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{score.score}</p>
              <p className="text-muted-foreground text-xs">از ۱۰۰</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">هشدارها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing.alerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">هشداری وجود ندارد</p>
            ) : (
              briefing.alerts.map((alert, i) => (
                <div key={`${alert.title}-${i}`} className="flex gap-2 text-sm">
                  {alertIcon(alert.level)}
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">اقدامات پیشنهادی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing.recommendations.length === 0 ? (
              <p className="text-muted-foreground text-sm">پیشنهادی وجود ندارد</p>
            ) : (
              briefing.recommendations.map((rec, i) => (
                <div key={rec.id ?? `${rec.title}-${i}`} className="space-y-2 rounded-md border p-3 text-sm">
                  <p className="font-medium">{rec.title}</p>
                  <p className="text-muted-foreground">{rec.description}</p>
                  {rec.requiresConfirmation && rec.payload ? (
                    <Button
                      size="sm"
                      disabled={confirmingId === rec.id}
                      onClick={() => void confirmRecommendation(rec)}
                    >
                      {confirmingId === rec.id ? 'در حال ایجاد...' : 'تأیید و ایجاد وظیفه'}
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
