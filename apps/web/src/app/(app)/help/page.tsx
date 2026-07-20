import { HelpGuide } from '@/components/help/help-guide';
import { PageHeader } from '@/components/layout/page-header';
import { requireRole } from '@/lib/auth/session';

export default async function HelpPage() {
  await requireRole('STAFF');

  return (
    <div className="space-y-6">
      <PageHeader
        title="راهنمای کسب‌یار"
        description="آموزش کامل بخش‌های هوشمند و عملیات — از اتاق فرمان تا اتوماسیون"
      />
      <HelpGuide />
    </div>
  );
}
