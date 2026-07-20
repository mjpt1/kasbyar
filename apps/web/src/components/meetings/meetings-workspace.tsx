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

type Meeting = {
  id: string;
  title: string;
  status: string;
  transcripts?: Array<{
    id: string;
    summary?: string | null;
    decisions: unknown;
    actionItems: unknown;
  }>;
};

export function MeetingsWorkspace() {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pasteTranscript, setPasteTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (data.success) {
        setMeetings(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.error?.message ?? 'بارگذاری جلسات ناموفق بود');
      }
    } catch {
      toast.error('خطا در بارگذاری جلسات');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          transcript: transcript.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت جلسه ناموفق بود');
        return;
      }
      const createdId =
        (data.data?.meeting?.id as string | undefined) ??
        (data.data?.id as string | undefined);
      if (createdId) setSelectedId(createdId);
      toast.success(
        transcript.trim()
          ? 'جلسه ثبت و متن پردازش شد'
          : 'جلسه ثبت شد',
      );
      setTitle('');
      setTranscript('');
      await load();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  async function attachTranscript() {
    const meetingId = selectedId ?? meetings[0]?.id;
    if (!meetingId) {
      toast.error('ابتدا یک جلسه انتخاب کنید');
      return;
    }
    if (pasteTranscript.trim().length < 10) {
      toast.error('متن جلسه حداقل ۱۰ کاراکتر باشد');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, transcript: pasteTranscript.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'پردازش متن ناموفق بود');
        return;
      }
      setSelectedId(meetingId);
      toast.success('تصمیم‌ها و اقدامات استخراج شد');
      setPasteTranscript('');
      await load();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  const selected = meetings.find((m) => m.id === selectedId) ?? meetings[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="دستیار جلسات"
        description="ثبت جلسه، متن، تصمیم‌ها و وظایف"
        actions={<HelpLink section="meetings" />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جلسه جدید</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>عنوان</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>متن جلسه (اختیاری)</Label>
            <Textarea
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="تصمیم: ...&#10;اقدام: ..."
            />
          </div>
          <Button onClick={() => void create()} disabled={loading || title.trim().length < 2}>
            {loading ? 'در حال ثبت...' : 'ثبت جلسه'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">جلسات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {meetings.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`w-full rounded-md border p-3 text-right text-sm ${
                  selected?.id === m.id ? 'border-primary bg-muted/40' : ''
                }`}
                onClick={() => setSelectedId(m.id)}
              >
                <p className="font-medium">{m.title}</p>
                <p className="text-muted-foreground text-xs">{m.status}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">جزئیات / افزودن متن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selected ? (
              <>
                <p className="font-medium">{selected.title}</p>
                {(selected.transcripts ?? []).map((t) => (
                  <div key={t.id} className="space-y-2 rounded-md border p-3">
                    <p>{t.summary}</p>
                    <div>
                      <p className="font-medium">تصمیم‌ها</p>
                      <ul className="list-disc pr-5">
                        {(Array.isArray(t.decisions) ? t.decisions : []).map((d) => (
                          <li key={String(d)}>{String(d)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">اقدامات</p>
                      <ul className="list-disc pr-5">
                        {(Array.isArray(t.actionItems) ? t.actionItems : []).map((a) => (
                          <li key={String(a)}>{String(a)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
                <Textarea
                  rows={4}
                  value={pasteTranscript}
                  onChange={(e) => setPasteTranscript(e.target.value)}
                  placeholder="متن جدید جلسه را بچسبانید…"
                />
                <Button
                  variant="outline"
                  onClick={() => void attachTranscript()}
                  disabled={loading || !selected.id}
                >
                  پردازش متن و ساخت وظیفه
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">جلسه‌ای انتخاب نشده</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
