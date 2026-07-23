import { OrgModulesPanel } from '@/components/platform/org-modules-panel';
import { PlatformWorkspace } from '@/components/platform/platform-workspace';
import { PageHeader } from '@/components/layout/page-header';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { canManageSettings } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';

export default async function PlatformPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const canManage = canManageSettings(session.role as MembershipRole);

  return (
    <div className="space-y-8">
      <section>
        <PageHeader
          title="افزونه‌های سازمان"
          description="فعال یا غیرفعال کردن ماژول‌ها برای این فضای کاری"
        />
        <OrgModulesPanel canManage={canManage} />
      </section>
      <section>
        <PlatformWorkspace />
      </section>
    </div>
  );
}
