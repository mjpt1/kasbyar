'use client';

import { Brain, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Citation = { title: string; excerpt: string; sourceType: string };
type TimelineEntry = { id: string; title: string; summary: string; occurredAt: string; type: string };

export function MemoryWorkspace() {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [sourceType, setSourceType] = useState('NOTE');
  const [query, setQuery] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadTimeline() {
    const res = await fetch('/api/memory/timeline');
    const data = await res.json();
    if (data.success) setTimeline(data.data ?? []);
  }

  useEffect(() => {
    void loadTimeline();
  }, []);

  async function ingest() {
    setLoading(true);
    try {
      const res = await fetch('/api/memory/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, rawText, sourceType }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت حافظه ناموفق بود');
        return;
      }
      toast.success('سند به حافظه اضافه شد');
      setTitle('');
      setRawText('');
      await loadTimeline();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  async function search() {
    setLoading(true);
    try {
      const res = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 8 }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'جستجو ناموفق بود');
        return;
      }
      setCitations(data.data.citations ?? []);
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="حافظه کسب‌وکار"
        description="ثبت دانش سازمانی، جستجو و تایم‌لاین رویدادها"
        actions={<HelpLink section="memory" />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ثبت دانش</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>عنوان</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً قرارداد مشتری الف" />
            </div>
            <div className="space-y-2">
              <Label>نوع منبع</Label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTE">یادداشت</SelectItem>
                  <SelectItem value="CONTRACT">قرارداد</SelectItem>
                  <SelectItem value="MEETING">جلسه</SelectItem>
                  <SelectItem value="MANUAL">دستی</SelectItem>
                  <SelectItem value="FILE">فایل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>متن</Label>
              <Textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="متن سند یا یادداشت را وارد کنید…"
              />
            </div>
            <Button onClick={() => void ingest()} disabled={loading || !title || rawText.length < 5}>
              {loading ? 'در حال ثبت...' : 'افزودن به حافظه'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="size-4" />
              جستجو
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثلاً شرایط پرداخت قرارداد"
              />
              <Button onClick={() => void search()} disabled={loading || query.length < 2}>
                جستجو
              </Button>
            </div>
            {citations.length === 0 ? (
              <p className="text-muted-foreground text-sm">نتیجه‌ای نمایش داده نشده است</p>
            ) : (
              <div className="space-y-2">
                {citations.map((c, i) => (
                  <div key={`${c.title}-${i}`} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-muted-foreground text-xs">{c.sourceType}</p>
                    <p className="mt-1">{c.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تایم‌لاین حافظه</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="هنوز رویدادی ثبت نشده"
              description="با افزودن سند، تایم‌لاین پر می‌شود."
            />
          ) : (
            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item.id} className="border-b pb-3 text-sm last:border-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">{item.summary}</p>
                  <p className="text-muted-foreground mt-1 text-xs" dir="ltr">
                    {item.type} · {new Date(item.occurredAt).toLocaleString('fa-IR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
