'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/error-state';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app-error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <ErrorState
          title="خطای برنامه"
          description="مشکلی در نمایش این صفحه رخ داد. می‌توانید دوباره تلاش کنید یا به داشبورد برگردید."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
