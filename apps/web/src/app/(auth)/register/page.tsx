'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDUSTRY_PACK_LABELS } from '@kesbyar/shared';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [industryPack, setIndustryPack] = useState('GENERAL');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
          organizationName: form.get('organizationName'),
          industryPack,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت‌نام ناموفق');
        return;
      }
      toast.success('ثبت‌نام با موفقیت انجام شد');
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
          <CardTitle className="text-2xl">ثبت‌نام در کسب‌یار</CardTitle>
          <CardDescription>کسب‌وکار خود را در چند دقیقه راه‌اندازی کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام شما</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationName">نام کسب‌وکار</Label>
              <Input id="organizationName" name="organizationName" required />
            </div>
            <div className="space-y-2">
              <Label>نوع کسب‌وکار</Label>
              <Select value={industryPack} onValueChange={setIndustryPack}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INDUSTRY_PACK_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" name="email" type="email" required dir="ltr" className="text-left" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" name="password" type="password" required minLength={6} dir="ltr" className="text-left" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            حساب دارید؟{' '}
            <Link href="/login" className="text-primary hover:underline">
              ورود
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
