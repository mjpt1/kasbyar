'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Tab = 'competitors' | 'market' | 'content' | 'seo' | 'sentiment';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'competitors', label: 'رقبا' },
  { id: 'market', label: 'بازار' },
  { id: 'content', label: 'محتوا' },
  { id: 'seo', label: 'سئو' },
  { id: 'sentiment', label: 'احساس مشتری' },
];

export function GrowthWorkspace() {
  const [tab, setTab] = useState<Tab>('competitors');
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  // competitor
  const [competitorName, setCompetitorName] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [competitorNotes, setCompetitorNotes] = useState('');
  // market
  const [marketCategory, setMarketCategory] = useState('عمومی');
  const [marketTitle, setMarketTitle] = useState('');
  const [marketSummary, setMarketSummary] = useState('');
  // content
  const [contentType, setContentType] = useState('post');
  const [brief, setBrief] = useState('');
  // seo
  const [keyword, setKeyword] = useState('');
  // sentiment
  const [customerId, setCustomerId] = useState('');
  const [sentimentText, setSentimentText] = useState('');
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);

  async function load() {
    setLoading(true);
    try {
      if (tab === 'sentiment') {
        const res = await fetch('/api/sentiment');
        const data = await res.json();
        if (data.success) setItems(data.data);
        return;
      }
      const type =
        tab === 'competitors' ? 'competitors' : tab === 'market' ? 'market' : tab === 'content' ? 'content' : 'seo';
      const res = await fetch(`/api/growth?type=${type}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [tab]);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : data.data?.items ?? [];
        setCustomers(
          list.slice(0, 50).map((c: { id: string; name: string }) => ({
            id: c.id,
            name: c.name,
          })),
        );
      }
    })();
  }, []);

  async function submit() {
    setLoading(true);
    try {
      if (tab === 'sentiment') {
        const res = await fetch('/api/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId, content: sentimentText }),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error?.message ?? 'تحلیل ناموفق بود');
          return;
        }
        toast.success('احساس ثبت شد');
        setSentimentText('');
        await load();
        return;
      }

      const body =
        tab === 'competitors'
          ? {
              type: 'competitor',
              competitorName,
              url: competitorUrl,
              notes: competitorNotes,
            }
          : tab === 'market'
            ? {
                type: 'market',
                category: marketCategory,
                title: marketTitle,
                summary: marketSummary,
              }
            : tab === 'content'
              ? { type: 'content', contentType, brief }
              : { type: 'seo', keyword };

      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت ناموفق بود');
        return;
      }
      toast.success('ثبت شد');
      await load();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  async function runSeoStep(taskId: string, step: string) {
    const res = await fetch('/api/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'seo-step', taskId, step, status: 'done' }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('گام انجام شد');
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="رشد و هوش بازار"
        description="رقبا، سیگنال بازار، محتوا، سئو و احساس مشتری"
        actions={<HelpLink section="growth" />}
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={tab === t.id ? 'default' : 'outline'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ثبت جدید</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {tab === 'competitors' ? (
            <>
              <div className="space-y-2">
                <Label>نام رقیب</Label>
                <Input value={competitorName} onChange={(e) => setCompetitorName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>آدرس (اختیاری)</Label>
                <Input value={competitorUrl} onChange={(e) => setCompetitorUrl(e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>یادداشت / مشاهده</Label>
                <Textarea value={competitorNotes} onChange={(e) => setCompetitorNotes(e.target.value)} />
              </div>
            </>
          ) : null}
          {tab === 'market' ? (
            <>
              <div className="space-y-2">
                <Label>دسته</Label>
                <Input value={marketCategory} onChange={(e) => setMarketCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>عنوان</Label>
                <Input value={marketTitle} onChange={(e) => setMarketTitle(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>خلاصه سیگنال</Label>
                <Textarea value={marketSummary} onChange={(e) => setMarketSummary(e.target.value)} />
              </div>
            </>
          ) : null}
          {tab === 'content' ? (
            <>
              <div className="space-y-2">
                <Label>نوع</Label>
                <Input value={contentType} onChange={(e) => setContentType(e.target.value)} placeholder="post | email | campaign | sms" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>بریف</Label>
                <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} />
              </div>
            </>
          ) : null}
          {tab === 'seo' ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>کلمه کلیدی</Label>
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>
          ) : null}
          {tab === 'sentiment' ? (
            <>
              <div className="space-y-2 sm:col-span-2">
                <Label>مشتری</Label>
                <select
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">انتخاب مشتری</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>متن بازخورد</Label>
                <Textarea value={sentimentText} onChange={(e) => setSentimentText(e.target.value)} />
              </div>
            </>
          ) : null}
          <div>
            <Button onClick={() => void submit()} disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت / تولید'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">نتایج</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {items.length === 0 ? (
            <p className="text-muted-foreground">موردی نیست</p>
          ) : (
            items.map((raw, idx) => {
              const item = raw as Record<string, unknown>;
              if (tab === 'seo') {
                const actions = (Array.isArray(item.actions) ? item.actions : []) as Array<
                  Record<string, unknown>
                >;
                const results = (item.results ?? {}) as Record<string, unknown>;
                return (
                  <div key={String(item.id ?? idx)} className="space-y-2 rounded-md border p-3">
                    <p className="font-medium">{String(item.keyword)}</p>
                    <p className="text-muted-foreground text-xs">
                      outline: {JSON.stringify(results.outline ?? []).slice(0, 180)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {actions.map((a) => (
                        <Button
                          key={String(a.step)}
                          size="sm"
                          variant="outline"
                          disabled={a.status === 'done'}
                          onClick={() => void runSeoStep(String(item.id), String(a.step))}
                        >
                          {String(a.label ?? a.step)} ({String(a.status)})
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              }
              if (tab === 'content') {
                return (
                  <div key={String(item.id ?? idx)} className="rounded-md border p-3">
                    <p className="font-medium">{String(item.title)}</p>
                    <p className="text-muted-foreground whitespace-pre-line">{String(item.body)}</p>
                  </div>
                );
              }
              if (tab === 'sentiment') {
                return (
                  <div key={String(item.id ?? idx)} className="rounded-md border p-3">
                    <p className="font-medium">
                      {(item.customer as { name?: string } | undefined)?.name ?? 'مشتری'} —{' '}
                      {String(item.label)}
                    </p>
                    <p className="text-muted-foreground">{String(item.summary ?? '')}</p>
                  </div>
                );
              }
              if (tab === 'competitors') {
                const data = (item.data ?? {}) as { analysis?: { summary?: string } };
                return (
                  <div key={String(item.id ?? idx)} className="rounded-md border p-3">
                    <p className="font-medium">{String(item.competitorName)}</p>
                    <p className="text-muted-foreground">
                      {data.analysis?.summary ?? JSON.stringify(item.data).slice(0, 200)}
                    </p>
                  </div>
                );
              }
              return (
                <div key={String(item.id ?? idx)} className="rounded-md border p-3">
                  <p className="font-medium">{String(item.title)}</p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {String(item.summary ?? '')}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
