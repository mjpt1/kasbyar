import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

import { DemoBanner } from '@/components/demo/demo-banner';
import { DemoToolbarActions } from '@/components/demo/demo-walkthrough';
import { AppHeader } from '@/components/layout/app-header';
import { AppLayoutClient } from '@/components/layout/app-layout-client';
import { PushPermissionPrompt } from '@/components/notifications/push-permission-prompt';
import { getSession, requireActiveWorkspace } from '@/lib/auth/session';
import { canShowDemoControls } from '@/lib/demo';
import { needsOnboarding } from '@/server/onboarding/onboarding.service';

export async function AppShell({ children }: { children: React.ReactNode }) {
  await requireActiveWorkspace();
  const session = await getSession();
  if (!session) redirect('/login');

  const pathname = (await headers()).get('x-pathname') ?? '';
  const onOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding/');

  if (!onOnboarding && needsOnboarding(session.role, session.industrySpecialty)) {
    redirect('/onboarding');
  }

  const showDemo = canShowDemoControls();

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
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
            showNotifications={!onOnboarding}
          />
        }
      >
        {children}
      </AppLayoutClient>
      {!onOnboarding ? <PushPermissionPrompt /> : null}
    </div>
  );
}
