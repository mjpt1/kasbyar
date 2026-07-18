'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { DemoLoginShortcuts } from '@/components/demo/demo-login-shortcuts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ورود ناموفق');
        return;
      }
      toast.success('خوش آمدید');
      // Full navigation so the session cookie is always sent on the next request.
      window.location.assign('/dashboard');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ورود به کسب‌یار</CardTitle>
          <CardDescription>سیستم‌عامل هوشمند کسب‌وکار شما</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" name="email" type="email" required dir="ltr" className="text-left" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" name="password" type="password" required dir="ltr" className="text-left" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            حساب ندارید؟{' '}
            <Link href="/register" className="text-primary hover:underline">
              ثبت‌نام
            </Link>
          </p>
          <p className="mt-3 text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary hover:underline">
              بازگشت به صفحهٔ اصلی
            </Link>
          </p>
          <DemoLoginShortcuts />
        </CardContent>
      </Card>
    </div>
  );
}
