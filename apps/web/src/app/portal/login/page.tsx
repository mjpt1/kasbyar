import { Suspense } from 'react';

import { PortalLoginForm } from '@/components/features/portal/portal-login-form';

export default function PortalLoginPage() {
  return (
    <div className="ky-portal-shell flex min-h-screen items-center justify-center px-4 py-10" dir="rtl">
      <Suspense fallback={<p className="text-sm text-muted-foreground">در حال بارگذاری…</p>}>
        <PortalLoginForm />
      </Suspense>
    </div>
  );
}
