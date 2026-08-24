'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { getPackTheme, packThemeToCssVars } from '@kesbyar/shared';

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutClientProps {
  organizationName: string;
  organizationId?: string;
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
  organizationId,
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
  const theme = getPackTheme(industryPack);
  const themeVars = packThemeToCssVars(theme) as CSSProperties;

  return (
    <div
      className="flex min-h-0 flex-1 overflow-hidden"
      data-pack={industryPack}
      data-pack-theme={theme.id}
      data-layout={theme.layout}
      data-density={theme.density}
      style={themeVars}
    >
      <aside className="ky-pack-sidebar hidden h-full w-64 shrink-0 flex-col overflow-hidden border-e md:flex">
        <SidebarNav
          organizationName={organizationName}
          organizationId={organizationId}
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
          <aside className="ky-pack-sidebar absolute inset-y-0 right-0 flex w-[min(100%,18rem)] flex-col shadow-xl">
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
                organizationId={organizationId}
                userName={userName}
                industryPack={industryPack}
                industrySpecialty={industrySpecialty}
                role={role}
                isSuperAdmin={isSuperAdmin}
                moduleToggles={moduleToggles}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="ky-pack-header shrink-0 border-b px-3 py-3 sm:px-6 sm:py-4">
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
            'ky-pack-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6',
            'pb-[max(1rem,env(safe-area-inset-bottom))]',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
