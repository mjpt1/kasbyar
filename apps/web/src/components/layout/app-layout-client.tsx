'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutClientProps {
  organizationName: string;
  userName: string;
  industryPack: string;
  industrySpecialty?: string | null;
  role: string;
  isSuperAdmin?: boolean;
  moduleToggles?: Record<string, boolean>;
  header: ReactNode;
  children: ReactNode;
}

export function AppLayoutClient({
  organizationName,
  userName,
  industryPack,
  industrySpecialty = null,
  role,
  isSuperAdmin = false,
  moduleToggles,
  header,
  children,
}: AppLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="hidden h-full w-64 shrink-0 flex-col overflow-hidden border-e bg-card md:flex">
        <SidebarNav
          organizationName={organizationName}
          userName={userName}
          industryPack={industryPack}
          industrySpecialty={industrySpecialty}
          role={role}
          isSuperAdmin={isSuperAdmin}
          moduleToggles={moduleToggles}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="بستن منو"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(100%,18rem)] flex-col bg-card shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b p-3">
              <span className="text-sm font-medium">منو</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="بستن"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <SidebarNav
                organizationName={organizationName}
                userName={userName}
                industryPack={industryPack}
                industrySpecialty={industrySpecialty}
                role={role}
                isSuperAdmin={isSuperAdmin}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b bg-background px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-0.5 shrink-0 md:hidden"
              aria-label="باز کردن منو"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">{header}</div>
          </div>
        </div>
        <main
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/20 p-3 sm:p-6',
            'pb-[max(1rem,env(safe-area-inset-bottom))]',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
