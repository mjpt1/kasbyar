import { redirect } from 'next/navigation';

import { DemoBanner } from '@/components/demo/demo-banner';
import { DemoToolbarActions } from '@/components/demo/demo-walkthrough';
import { AppHeader } from '@/components/layout/app-header';
import { AppLayoutClient } from '@/components/layout/app-layout-client';
import { getSession, requireActiveWorkspace } from '@/lib/auth/session';
import { canShowDemoControls } from '@/lib/demo';

export async function AppShell({ children }: { children: React.ReactNode }) {
  await requireActiveWorkspace();
  const session = await getSession();
  if (!session) redirect('/login');

  const showDemo = canShowDemoControls();

  return (
    <div className="flex min-h-screen flex-col">
      {showDemo ? <DemoBanner /> : null}
      <AppLayoutClient
        organizationName={session.organizationName}
        userName={session.user.name}
        industryPack={session.industryPack}
        industrySpecialty={session.industrySpecialty}
        role={session.role}
        isSuperAdmin={session.isSuperAdmin}
        header={
          <AppHeader
            organizationName={session.organizationName}
            demoToolbar={showDemo ? <DemoToolbarActions /> : undefined}
          />
        }
      >
        {children}
      </AppLayoutClient>
    </div>
  );
}
