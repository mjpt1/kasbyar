import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'خطا در بارگذاری',
  description = 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
  icon: Icon = AlertCircle,
  retryLabel = 'تلاش مجدد',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 py-16 text-center"
      role="alert"
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <Icon className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
