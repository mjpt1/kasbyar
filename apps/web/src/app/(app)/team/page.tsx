import { PLAN_FEATURE_LABELS } from '@kesbyar/shared';
import { UsersRound } from 'lucide-react';

import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import { TeamPerformanceDashboard } from '@/components/features/team/team-performance-dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { requireRole } from '@/lib/auth/session';
import { checkFeature } from '@/server/billing/entitlement.service';
import { getTeamPerformanceOverview } from '@/server/team/team-performance.service';

export default async function TeamPerformancePage() {
  const session = await requireRole('MANAGER');
  const access = await checkFeature(session.organizationId, 'reports');

  if (!access.allowed) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="عملکرد تیم"
          description="نمره عملکرد اعضا و راهنمای مدیر"
        />
        <UpgradePrompt
          message={
            access.message ??
            `قابلیت ${PLAN_FEATURE_LABELS.reports} در طرح فعلی شما فعال نیست.`
          }
          suggestedPlan={access.suggestedPlan}
        />
      </div>
    );
  }

  const overview = await getTeamPerformanceOverview(session.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="عملکرد تیم"
        description="نمره ترکیبی (وظایف + مکالمات + احساس مشتری) — rule-based + تحلیل هوشمند"
      />

      {overview.members.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="عضوی در تیم ثبت نشده"
          description="از تنظیمات > اعضا، کاربران سازمان را اضافه کنید."
        />
      ) : (
        <TeamPerformanceDashboard
          members={overview.members}
          insights={overview.insights}
          coachingSuggestions={overview.coachingSuggestions}
          periodLabel={overview.periodLabel}
          conversationSummary={overview.conversationSummary}
        />
      )}
    </div>
  );
}
