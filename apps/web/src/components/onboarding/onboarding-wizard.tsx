'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PackOption {
  id: string;
  label: string;
  description: string;
}

interface SpecialtyOption {
  id: string;
  label: string;
  description: string;
  basePack: string;
}

export function OnboardingWizard({
  initialName,
  initialPack,
}: {
  initialName: string;
  initialPack: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [pack, setPack] = useState(initialPack || 'GENERAL');
  const [specialty, setSpecialty] = useState('');
  const [packs, setPacks] = useState<PackOption[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [packFromSignup, setPackFromSignup] = useState(Boolean(initialPack));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      setOptionsLoading(true);
      try {
        const res = await fetch('/api/onboarding');
        const json = await res.json();
        if (json?.success) {
          setPacks(json.data.packs ?? []);
          setSpecialties(json.data.specialties ?? []);
          if (json.data.current?.name) setName(json.data.current.name);
          if (json.data.current?.industryPack) {
            setPack(json.data.current.industryPack);
            setPackFromSignup(true);
          }
          if (json.data.current?.industrySpecialty) {
            setSpecialty(json.data.current.industrySpecialty);
          }
        }
      } finally {
        setOptionsLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => specialties.filter((s) => s.basePack === pack),
    [specialties, pack],
  );

  useEffect(() => {
    if (specialty && !filtered.some((s) => s.id === specialty)) {
      setSpecialty('');
    }
  }, [filtered, specialty]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!specialty) {
      setError('تخصص کسب‌وکار را انتخاب کنید');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          industryPack: pack,
          industrySpecialty: specialty,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(json?.error?.message ?? 'ذخیره نشد');
        return;
      }
      router.replace(json.data.homePath || '/dashboard');
      router.refresh();
    } catch {
      setError('ارتباط برقرار نشد');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-xl flex-col justify-center px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">کسب‌وکارتان را بشناسید</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        یک‌بار شغل و نام کسب‌وکار را بگویید تا داشبورد و منوی مناسب همان حوزه را باز کنیم.
        اگر سوپرادمین قبلاً تخصص را تنظیم کرده باشد، این صفحه نشان داده نمی‌شود.
      </p>

      {optionsLoading ? (
        <p className="mt-8 text-sm text-muted-foreground" role="status">
          در حال بارگذاری گزینه‌ها…
        </p>
      ) : (
        <form onSubmit={(e) => void submit(e)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="biz-name">نام شرکت یا کسب‌وکار</Label>
            <Input
              id="biz-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً کلینیک نور یا فروشگاه آفتاب"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pack">حوزهٔ کاری</Label>
            <select
              id="pack"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={pack}
              onChange={(e) => {
                setPack(e.target.value);
                setPackFromSignup(false);
              }}
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {packFromSignup
                ? 'این حوزه از ثبت‌نام آمده است؛ در صورت نیاز می‌توانید عوض کنید.'
                : packs.find((p) => p.id === pack)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">تخصص دقیق‌تر</Label>
            <select
              id="specialty"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
              disabled={filtered.length === 0}
            >
              <option value="">
                {filtered.length === 0 ? 'برای این حوزه تخصصی تعریف نشده' : 'انتخاب کنید…'}
              </option>
              {filtered.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {filtered.length === 0 ? (
              <p className="text-xs text-amber-700">
                برای این حوزه هنوز تخصصی ثبت نشده. حوزهٔ کاری دیگری انتخاب کنید.
              </p>
            ) : null}
            {specialty ? (
              <p className="text-xs text-muted-foreground">
                {filtered.find((s) => s.id === specialty)?.description}
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={busy || filtered.length === 0 || !specialty}>
            {busy ? 'در حال ذخیره…' : 'ادامه و ورود به داشبورد'}
          </Button>
        </form>
      )}
    </div>
  );
}
