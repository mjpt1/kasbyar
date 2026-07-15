'use client';

import { SidebarNav } from '@/components/layout/sidebar-nav';

interface AppSidebarProps {
  organizationName: string;
  userName: string;
  industryPack: string;
}

/** @deprecated Desktop sidebar — prefer AppLayoutClient */
export function AppSidebar(props: AppSidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col border-e bg-card">
      <SidebarNav {...props} />
    </aside>
  );
}
