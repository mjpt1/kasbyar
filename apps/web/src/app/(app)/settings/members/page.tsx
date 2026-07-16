import { MembersManagePanel } from '@/components/features/settings/members-manage-panel';
import { PageHeader } from '@/components/layout/page-header';
import { requireRole } from '@/lib/auth/session';
import { listOrganizationMembers } from '@/server/settings/settings.service';

export default async function SettingsMembersPage() {
  const session = await requireRole('ADMIN');
  const members = await listOrganizationMembers(session.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="اعضا و نقش‌ها"
        description="نقش هر عضو تعیین می‌کند چه بخش‌هایی از سیستم را ببیند — کارمند به اتوماسیون و گزارش‌های مدیریتی دسترسی ندارد."
      />
      <MembersManagePanel
        initialMembers={members}
        currentUserId={session.user.id}
      />
    </div>
  );
}
