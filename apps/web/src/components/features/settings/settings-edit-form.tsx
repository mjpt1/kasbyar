'use client';

import { canManageSettings } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SpecialtyOption {
  id: string;
  label: string;
  description: string;
  basePack: string;
}

interface SettingsEditFormProps {
  role: MembershipRole;
  org: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    taxId: string | null;
    sheba: string | null;
    economicCode: string | null;
    companyNationalId: string | null;
    postalCode: string | null;
    province: string | null;
    city: string | null;
    taxMemoryId: string | null;
    defaultVatRate: number;
    showTomanAlongside: boolean;
    industryPack: string;
    industrySpecialty: string | null;
  };
  specialties: SpecialtyOption[];
}

export function SettingsEditForm({ role, org, specialties }: SettingsEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState(org.industrySpecialty ?? '');
  const canEdit = canManageSettings(role);

  const packSpecialties = useMemo(
    () => specialties.filter((s) => s.basePack === org.industryPack),
    [specialties, org.industryPack],
  );

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
          sheba: form.get('sheba') || undefined,
          economicCode: form.get('economicCode') || undefined,
          companyNationalId: form.get('companyNationalId') || undefined,
          postalCode: form.get('postalCode') || undefined,
          province: form.get('province') || undefined,
          city: form.get('city') || undefined,
          taxMemoryId: form.get('taxMemoryId') || undefined,
          defaultVatRate: form.get('defaultVatRate')
            ? Number(form.get('defaultVatRate'))
            : undefined,
          showTomanAlongside: form.get('showTomanAlongside') === 'on',
          industrySpecialty: specialty || undefined,
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
              className="text-start"
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
              className="text-start"
              defaultValue={org.email ?? ''}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-address">آدرس</Label>
            <Input id="org-address" name="address" defaultValue={org.address ?? ''} />
          </div>

          <div className="sm:col-span-2 space-y-1 border-t border-border/70 pt-4">
            <p className="text-sm font-medium">اطلاعات هویتی و مالیاتی ایران</p>
            <p className="text-xs text-muted-foreground">
              برای فاکتور رسمی، مؤدیان و تسویه بانکی — اختیاری ولی توصیه‌شده.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-tax">شناسه مالیاتی</Label>
            <Input
              id="org-tax"
              name="taxId"
              dir="ltr"
              className="text-start"
              defaultValue={org.taxId ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-economic">کد اقتصادی</Label>
            <Input
              id="org-economic"
              name="economicCode"
              dir="ltr"
              className="text-start"
              defaultValue={org.economicCode ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-company-nid">شناسه ملی / کد ملی</Label>
            <Input
              id="org-company-nid"
              name="companyNationalId"
              dir="ltr"
              className="text-start"
              defaultValue={org.companyNationalId ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-tax-memory">شناسه حافظه مالیاتی (مؤدیان)</Label>
            <Input
              id="org-tax-memory"
              name="taxMemoryId"
              dir="ltr"
              className="text-start"
              defaultValue={org.taxMemoryId ?? ''}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-sheba">شبا</Label>
            <Input
              id="org-sheba"
              name="sheba"
              dir="ltr"
              className="text-start"
              placeholder="IRxxxxxxxxxxxxxxxxxxxxxxxx"
              defaultValue={org.sheba ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-postal">کد پستی</Label>
            <Input
              id="org-postal"
              name="postalCode"
              dir="ltr"
              className="text-start"
              defaultValue={org.postalCode ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-province">استان</Label>
            <Input id="org-province" name="province" defaultValue={org.province ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-city">شهر</Label>
            <Input id="org-city" name="city" defaultValue={org.city ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-vat">نرخ پیش‌فرض ارزش افزوده (٪)</Label>
            <Input
              id="org-vat"
              name="defaultVatRate"
              type="number"
              min={0}
              max={100}
              step={0.01}
              dir="ltr"
              className="text-start"
              defaultValue={org.defaultVatRate}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="org-toman"
              name="showTomanAlongside"
              type="checkbox"
              defaultChecked={org.showTomanAlongside}
              className="size-4 cursor-pointer rounded border-input accent-primary"
            />
            <Label htmlFor="org-toman" className="cursor-pointer font-normal">
              نمایش تومان کنار ریال (واحد ذخیره همچنان ریال است)
            </Label>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="org-specialty">تخصص کسب‌وکار</Label>
            <select
              id="org-specialty"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required={packSpecialties.length > 0}
            >
              <option value="">
                {packSpecialties.length === 0
                  ? 'برای این بسته تخصصی تعریف نشده'
                  : 'انتخاب کنید…'}
              </option>
              {packSpecialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {specialty ? (
              <p className="text-xs text-muted-foreground">
                {packSpecialties.find((s) => s.id === specialty)?.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                تخصص باید با بستهٔ صنعتی فعلی سازمان هم‌خوان باشد.
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading || (packSpecialties.length > 0 && !specialty)}>
              {loading ? 'در حال ذخیره…' : 'ذخیره'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
