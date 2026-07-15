import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { WorkspaceSelectClient } from '@/app/workspace/select/workspace-select-client';
import { ORG_COOKIE, SESSION_COOKIE } from '@/lib/auth/crypto';
import { canShowDemoControls } from '@/lib/demo';
import { prisma } from '@/lib/prisma';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

export default async function WorkspaceSelectPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect('/login');

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) redirect('/login');

  const workspaces = await listUserWorkspaces(session.user.id);
  if (workspaces.length === 0) redirect('/register');
  if (workspaces.length === 1) redirect('/dashboard');

  const currentOrganizationId = cookieStore.get(ORG_COOKIE)?.value;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">انتخاب فضای کاری</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            کسب‌وکار مورد نظر خود را برای ادامه انتخاب کنید
          </p>
        </div>
        <WorkspaceSelectClient
          workspaces={workspaces}
          currentOrganizationId={currentOrganizationId}
          showDemoHints={canShowDemoControls()}
        />
      </div>
    </div>
  );
}
