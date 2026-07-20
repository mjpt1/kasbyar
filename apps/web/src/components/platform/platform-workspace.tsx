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

type Plugin = {
  id: string;
  slug: string;
  name: string;
  version: string;
  description?: string | null;
  status: string;
  organizationId?: string | null;
};

type Learning = {
  insights: {
    totalFeedback: number;
    rankedAgents: Array<{ agentType: string; score: number; helpful: number; notHelpful: number }>;
    insights: Array<{ agentType: string; message: string }>;
  };
};

export function PlatformWorkspace() {
  const [view, setView] = useState<'plugins' | 'learning'>('plugins');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [learning, setLearning] = useState<Learning | null>(null);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      if (view === 'learning') {
        const res = await fetch('/api/platform?view=learning');
        const data = await res.json();
        if (data.success) setLearning(data.data);
      } else {
        const res = await fetch('/api/platform');
        const data = await res.json();
        if (data.success) setPlugins(data.data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [view]);

  async function register() {
    setLoading(true);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          version: '1.0.0',
          description,
          manifest: {
            slug,
            version: '1.0.0',
            agents: [
              {
                type: 'CUSTOM',
                name,
                goal: description || name,
                tools: [],
                permissions: ['read:customers'],
              },
            ],
          },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت افزونه ناموفق بود');
        return;
      }
      toast.success('افزونه ثبت شد');
      setSlug('');
      setName('');
      setDescription('');
      await load();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  async function toggle(pluginId: string, enabled: boolean) {
    const res = await fetch('/api/platform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', pluginId, enabled }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(enabled ? 'فعال شد' : 'غیرفعال شد');
      await load();
    } else {
      toast.error(data.error?.message ?? 'تغییر وضعیت ناموفق بود');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="پلتفرم و یادگیری"
        description="بازارچه افزونه و بازخورد عامل‌ها"
        actions={<HelpLink section="platform" />}
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === 'plugins' ? 'default' : 'outline'}
          onClick={() => setView('plugins')}
        >
          بازارچه افزونه
        </Button>
        <Button
          size="sm"
          variant={view === 'learning' ? 'default' : 'outline'}
          onClick={() => setView('learning')}
        >
          یادگیری تطبیقی
        </Button>
      </div>

      {view === 'plugins' ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ثبت افزونه</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>اسلاگ</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>نام</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>توضیح</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button onClick={() => void register()} disabled={loading || !slug || !name}>
                ثبت
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {plugins.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{p.description}</p>
                  <p className="text-xs" dir="ltr">
                    {p.slug} · v{p.version} · {p.status}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void toggle(p.id, true)}>
                      فعال
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void toggle(p.id, false)}>
                      غیرفعال
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">بینش یادگیری</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>کل بازخوردها: {learning?.insights.totalFeedback ?? 0}</p>
              {(learning?.insights.insights ?? []).map((i) => (
                <p key={i.agentType} className="rounded-md border p-3">
                  {i.message}
                </p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">رتبه‌بندی عامل‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(learning?.insights.rankedAgents ?? []).map((a) => (
                <div key={a.agentType} className="flex justify-between border-b py-2">
                  <span>{a.agentType}</span>
                  <span>
                    امتیاز {a.score} · مفید {a.helpful} · غیرمفید {a.notHelpful}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
