import { Suspense } from 'react';

import { PortalLoginForm } from '@/components/features/portal/portal-login-form';

export default function PortalLoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-emerald-50/40 px-4 py-10 dark:from-slate-950 dark:via-background dark:to-emerald-950/20"
      dir="rtl"
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">در حال بارگذاری…</p>}>
        <PortalLoginForm />
      </Suspense>
    </div>
  );
}
