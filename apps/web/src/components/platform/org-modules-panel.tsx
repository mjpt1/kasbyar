'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ORG_MODULE_CATEGORY_LABELS, type OrgModuleDefinition } from '@kesbyar/shared';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ModuleRow = OrgModuleDefinition & { enabled: boolean };

export function OrgModulesPanel({ canManage }: { canManage: boolean }) {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/org-modules');
      const json = await res.json();
      if (json?.success) setModules(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(moduleKey: string, enabled: boolean) {
    const res = await fetch('/api/org-modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleKey, enabled }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error?.message ?? 'تغییر وضعیت ناموفق بود');
      return;
    }
    toast.success(enabled ? 'ماژول فعال شد' : 'ماژول غیرفعال شد');
    setModules(json.data ?? []);
  }

  const grouped = modules.reduce<Record<string, ModuleRow[]>>((acc, mod) => {
    const key = mod.category;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(mod);
    return acc;
  }, {});

  if (loading) {
    return <p className="text-sm text-muted-foreground">در حال بارگذاری افزونه‌ها…</p>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            {ORG_MODULE_CATEGORY_LABELS[category as keyof typeof ORG_MODULE_CATEGORY_LABELS] ??
              category}
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((mod) => (
              <Card key={mod.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{mod.nameFa}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{mod.descriptionFa}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        mod.enabled ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {mod.enabled ? 'فعال' : 'غیرفعال'}
                    </span>
                    {canManage ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={mod.enabled ? 'outline' : 'default'}
                          onClick={() => void toggle(mod.key, true)}
                          disabled={mod.enabled}
                        >
                          فعال‌سازی
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void toggle(mod.key, false)}
                          disabled={!mod.enabled}
                        >
                          غیرفعال
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">فقط مدیر</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
