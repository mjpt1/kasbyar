'use client';

import type { ComponentProps } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface DestructiveActionButtonProps extends ComponentProps<typeof Button> {
  confirmTitle?: string;
  confirmMessage: string;
  onConfirmed: () => void | Promise<void>;
}

/** دکمه مخرب با تأیید صریح — برای حذف و عملیات برگشت‌ناپذیر */
export function DestructiveActionButton({
  confirmTitle = 'تأیید عملیات',
  confirmMessage,
  onConfirmed,
  children,
  disabled,
  ...props
}: DestructiveActionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(`${confirmTitle}\n\n${confirmMessage}`)) return;
    setLoading(true);
    try {
      await onConfirmed();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? 'در حال انجام…' : children}
    </Button>
  );
}
