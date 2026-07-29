'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, Mail, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PortalLoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDevLink(null);
    try {
      const res = await fetch('/api/portal/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationSlug,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'درخواست ناموفق بود');
        return;
      }
      toast.message('درخواست ثبت شد', { description: data.data.noticeFa });
      if (data.data.portalUrl) {
        setDevLink(data.data.portalUrl);
      }
    } catch {
      toast.error('اتصال برقرار نشد');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-5" aria-hidden />
          ورود به پورتال مشتری
        </CardTitle>
        <CardDescription>
          شناسه کسب‌وکار و ایمیل یا موبایل ثبت‌شده را وارد کنید تا لینک ورود برایتان ارسال شود.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error === 'expired' ? (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            لینک منقضی یا نامعتبر است. دوباره درخواست دهید.
          </p>
        ) : null}
        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div className="space-y-2">
            <Label htmlFor="org-slug">شناسه کسب‌وکار (slug)</Label>
            <Input
              id="org-slug"
              dir="ltr"
              value={organizationSlug}
              onChange={(e) => setOrganizationSlug(e.target.value)}
              placeholder="my-business"
              required
              autoComplete="organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portal-email" className="flex items-center gap-1">
              <Mail className="size-3.5" aria-hidden />
              ایمیل
            </Label>
            <Input
              id="portal-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portal-phone" className="flex items-center gap-1">
              <Phone className="size-3.5" aria-hidden />
              موبایل
            </Label>
            <Input
              id="portal-phone"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912…"
              autoComplete="tel"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'در حال ارسال…' : 'ارسال لینک ورود'}
          </Button>
        </form>
        {devLink ? (
          <p className="mt-4 break-all text-xs text-muted-foreground">
            لینک (در صورت نبود کانال پیام):{' '}
            <a href={devLink} className="text-primary underline">
              {devLink}
            </a>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
