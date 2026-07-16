'use client';

import { useState } from 'react';

import { MEMBERSHIP_ROLE_LABELS } from '@kesbyar/shared';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface PlatformSettingsData {
  defaultSignupMembershipRole: string;
  allowSelfRegistration: boolean;
}

export function AdminPlatformSettingsForm({
  initial,
}: {
  initial: PlatformSettingsData;
}) {
  const [settings, setSettings] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success('تنظیمات ذخیره شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ثبت‌نام و نقش پیش‌فرض</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="allow-reg">ثبت‌نام خودکار</Label>
            <p className="text-xs text-muted-foreground">
              اگر غیرفعال باشد، فقط سوپرادمین می‌تواند کاربر بسازد.
            </p>
          </div>
          <input
            id="allow-reg"
            type="checkbox"
            className="h-4 w-4"
            checked={settings.allowSelfRegistration}
            onChange={(e) =>
              setSettings({ ...settings, allowSelfRegistration: e.target.checked })
            }
          />
        </div>

        <div className="space-y-2 max-w-sm">
          <Label>نقش پیش‌فرض ثبت‌نام‌کننده در سازمان جدید</Label>
          <Select
            value={settings.defaultSignupMembershipRole}
            onValueChange={(v) =>
              setSettings({ ...settings, defaultSignupMembershipRole: v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MEMBERSHIP_ROLE_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            معمولاً «مالک» — کسی که خودش ثبت‌نام می‌کند مالک سازمان جدیدش می‌شود.
          </p>
        </div>

        <Button type="button" onClick={save} disabled={loading}>
          ذخیره تنظیمات
        </Button>
      </CardContent>
    </Card>
  );
}
