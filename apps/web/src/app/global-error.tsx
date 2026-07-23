'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/error-state';

import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md">
            <ErrorState
              title="خطای سیستم"
              description="خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید یا صفحه را بازنشانی کنید."
              onRetry={reset}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
