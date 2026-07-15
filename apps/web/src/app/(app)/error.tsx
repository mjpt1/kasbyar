'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/error-state';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard-error]', error);
  }, [error]);

  return (
    <ErrorState
      title="خطا در بارگذاری بخش"
      description="اطلاعات این بخش در دسترس نیست. لطفاً دوباره تلاش کنید."
      onRetry={reset}
    />
  );
}
