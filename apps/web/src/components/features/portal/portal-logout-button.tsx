'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function PortalLogoutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void fetch('/api/portal/logout', { method: 'POST' }).then(() => {
          window.location.href = '/portal/login';
        });
      }}
    >
      <LogOut className="size-3.5" aria-hidden />
      خروج از پورتال
    </Button>
  );
}
