import { PLAN_FEATURE_LABELS } from '@kesbyar/shared';

import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import { ConversationPanel } from '@/components/conversation/conversation-panel';
import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { requireSession } from '@/lib/auth/session';
import { checkFeature } from '@/server/billing/entitlement.service';

export default async function ConversationPage() {
  const session = await requireSession();
  const access = await checkFeature(session.organizationId, 'aiAssistant');

  return (
    <div className="space-y-6">
      <PageHeader
        title="دستیار عملیاتی"
        description="پرسش درباره فروش، مطالبات، سرنخ‌های فروش و وظایف — پایهٔ دستیار هوشمند کسب‌یار"
        actions={<HelpLink section="conversation" />}
      />
      {!access.allowed ? (
        <UpgradePrompt
          message={
            access.message ??
            `قابلیت ${PLAN_FEATURE_LABELS.aiAssistant} در طرح فعلی شما فعال نیست.`
          }
          suggestedPlan={access.suggestedPlan}
        />
      ) : (
        <ConversationPanel fullPage />
      )}
    </div>
  );
}
