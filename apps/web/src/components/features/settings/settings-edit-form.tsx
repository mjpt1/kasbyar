'use client';

import { canManageSettings } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsEditFormProps {
  role: MembershipRole;
  org: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    taxId: string | null;
  };
}

export function SettingsEditForm({ role, org }: SettingsEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canEdit = canManageSettings(role);

  if (!canEdit) {
    return (
      <p className="text-sm text-muted-foreground">
        فقط مدیران می‌توانند تنظیمات سازمان را ویرایش کنند.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone') || undefined,
          email: form.get('email') || undefined,
          address: form.get('address') || undefined,
          taxId: form.get('taxId') || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'به‌روزرسانی ناموفق بود');
        return;
      }
      toast.success('تنظیمات ذخیره شد');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        ویرایش اطلاعات سازمان
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ویرایش سازمان</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          بستن
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-name">نام کسب‌وکار</Label>
            <Input id="org-name" name="name" defaultValue={org.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-phone">تلفن</Label>
            <Input
              id="org-phone"
              name="phone"
              dir="ltr"
              className="text-left"
              defaultValue={org.phone ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-email">ایمیل</Label>
            <Input
              id="org-email"
              name="email"
              type="email"
              dir="ltr"
              className="text-left"
              defaultValue={org.email ?? ''}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-address">آدرس</Label>
            <Input id="org-address" name="address" defaultValue={org.address ?? ''} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-tax">شناسه مالیاتی</Label>
            <Input id="org-tax" name="taxId" defaultValue={org.taxId ?? ''} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
