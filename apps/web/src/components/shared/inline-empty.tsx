import type { LucideIcon } from 'lucide-react';

interface InlineEmptyProps {
  icon?: LucideIcon;
  message: string;
  hint?: string;
}

/** حالت خالی فشرده برای کارت‌های داشبورد و بخش‌های جزئی */
export function InlineEmpty({ icon: Icon, message, hint }: InlineEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 py-8 text-center">
      {Icon ? (
        <Icon className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden />
      ) : null}
      <p className="text-sm text-muted-foreground">{message}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p> : null}
    </div>
  );
}
