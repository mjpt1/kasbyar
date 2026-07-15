'use client';

import { DEMO_PASSWORD_HINT, DEMO_PERSONAS } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function DemoLoginShortcuts() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (!DEMO_ENABLED) return null;

  async function quickLogin(email: string) {
    setLoading(email);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: DEMO_PASSWORD_HINT }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ورود دمو ناموفق — ابتدا npm run db:reseed');
        return;
      }
      toast.success('ورود دمو موفق');
      router.push('/demo');
      router.refresh();
    } catch {
      toast.error('خطا در ورود');
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="mt-6 border-dashed border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">ورود سریع دمو</CardTitle>
        <CardDescription>
          فقط در محیط نمایش — رمز همه حساب‌ها: {DEMO_PASSWORD_HINT}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {DEMO_PERSONAS.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant="outline"
            className="h-auto justify-start py-3 text-right"
            disabled={loading === p.email}
            onClick={() => quickLogin(p.email)}
          >
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.title}</div>
            </div>
          </Button>
        ))}
        <Button type="button" variant="link" className="text-xs" onClick={() => router.push('/workspace/select')}>
          پس از ورود، سناریوی دمو را از صفحه انتخاب فضا انتخاب کنید
        </Button>
      </CardContent>
    </Card>
  );
}
