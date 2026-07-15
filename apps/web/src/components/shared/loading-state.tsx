import { Loader2 } from 'lucide-react';

/**
 * In-section client loading indicator — prefer route skeletons for navigation.
 * @see docs/performance/ui-state-consistency-rules.md
 */

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = 'در حال بارگذاری…',
  className = 'py-16',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}
