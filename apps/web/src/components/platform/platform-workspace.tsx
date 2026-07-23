'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ORG_MODULE_CATEGORY_LABELS } from '@kesbyar/shared';

type OrgModule = {
  key: string;
  nameFa: string;
  descriptionFa: string;
  category: 'integration' | 'ai' | 'operations';
  settingsHref?: string;
  enabled: boolean;
  configured: boolean;
  statusLabel: string;
  statusVariant: 'default' | 'secondary' | 'outline' | 'destructive';
};

type Plugin = {
  id: string;
  slug: string;
  name: string;
  version: string;
  description?: string | null;
  status: string;
};

type Learning = {
  insights: {
    totalFeedback: number;
    rankedAgents: Array<{ agentType: string; score: number; helpful: number; notHelpful: number }>;
    insights: Array<{ agentType: string; message: string }>;
  };
};

type View = 'modules' | 'agents' | 'learning';

export function PlatformWorkspace() {
  const [view, setView] = useState<View>('modules');
  const [modules, setModules] = useState<OrgModule[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [learning, setLearning] = useState<Learning | null>(null);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [canManage, setCanManage] = useState(true);

  async function load() {
    setLoading(true);
    try {
      if (view === 'learning') {
        const res = await fetch('/api/platform?view=learning');
        const data = await res.json();
        if (data.success) setLearning(data.data);
        return;
      }
      if (view === 'agents') {
        const res = await fetch('/api/platform?view=agents');
        const data = await res.json();
        if (data.success) setPlugins(data.data);
        return;
      }
      const res = await fetch('/api/platform?view=modules');
      const data = await res.json();
      if (data.success) setModules(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [view]);

  const modulesByCategory = useMemo(() => {
    const groups: Record<string, OrgModule[]> = {};
    for (const mod of modules) {
      groups[mod.category] ??= [];
      groups[mod.category]!.push(mod);
    }
    return groups;
  }, [modules]);

  async function registerAgent() {
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
        if (data.error?.code === 'FORBIDDEN') setCanManage(false);
        toast.error(data.error?.message ?? 'ثبت عامل ناموفق بود');
        return;
      }
      toast.success('عامل ثبت شد');
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

  async function toggleModule(moduleKey: string, enabled: boolean) {
    const res = await fetch('/api/platform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-module', moduleKey, enabled }),
    });
    const data = await res.json();
    if (data.success) {
      setModules(data.data);
      toast.success(enabled ? 'افزونه فعال شد' : 'افزونه غیرفعال شد');
    } else {
      if (data.error?.code === 'FORBIDDEN') setCanManage(false);
      toast.error(data.error?.message ?? 'تغییر وضعیت ناموفق بود');
    }
  }

  async function toggleAgent(pluginId: string, enabled: boolean) {
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
        title="افزونه‌ها و پلتفرم"
        description="مدیریت ماژول‌های محصول، یکپارچه‌سازی‌ها و عامل‌های هوشمند"
        actions={<HelpLink section="platform" />}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={view === 'modules' ? 'default' : 'outline'}
          onClick={() => setView('modules')}
        >
          افزونه‌های محصول ({modules.length || '…'})
        </Button>
        <Button
          size="sm"
          variant={view === 'agents' ? 'default' : 'outline'}
          onClick={() => setView('agents')}
        >
          عامل‌های هوشمند
        </Button>
        <Button
          size="sm"
          variant={view === 'learning' ? 'default' : 'outline'}
          onClick={() => setView('learning')}
        >
          یادگیری تطبیقی
        </Button>
      </div>

      {view === 'modules' ? (
        <div className="space-y-6">
          {!canManage ? (
            <p className="text-sm text-muted-foreground">
              فقط مالک یا مدیر می‌تواند افزونه‌ها را روشن یا خاموش کند.
            </p>
          ) : null}

          {Object.entries(modulesByCategory).map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {ORG_MODULE_CATEGORY_LABELS[category as keyof typeof ORG_MODULE_CATEGORY_LABELS] ??
                  category}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((mod) => (
                  <Card key={mod.key}>
                    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-base">{mod.nameFa}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{mod.descriptionFa}</p>
                      </div>
                      <Badge variant={mod.statusVariant}>{mod.statusLabel}</Badge>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant={mod.enabled ? 'outline' : 'default'}
                        disabled={loading || !canManage}
                        onClick={() => void toggleModule(mod.key, !mod.enabled)}
                      >
                        {mod.enabled ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                      </Button>
                      {mod.settingsHref && mod.enabled ? (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={mod.settingsHref}>
                            {mod.configured ? 'تنظیمات' : 'پیکربندی در تنظیمات'}
                          </Link>
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          {loading && modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
          ) : null}
        </div>
      ) : null}

      {view === 'agents' ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ثبت عامل سفارشی</CardTitle>
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
              <Button onClick={() => void registerAgent()} disabled={loading || !slug || !name}>
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
                    <Button size="sm" onClick={() => void toggleAgent(p.id, true)}>
                      فعال
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void toggleAgent(p.id, false)}>
                      غیرفعال
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {view === 'learning' ? (
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
      ) : null}
    </div>
  );
}
