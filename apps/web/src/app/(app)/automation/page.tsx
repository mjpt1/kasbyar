import {
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_TRIGGER_LABELS,
} from '@kesbyar/shared';
import { Workflow } from 'lucide-react';

import { AutomationCreateForm } from '@/components/features/automation/automation-create-form';
import { AutomationRunButton } from '@/components/features/automation/automation-run-button';
import { AutomationToggle } from '@/components/features/automation/automation-toggle';
import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Card, CardContent } from '@/components/ui/card';
import { requireRole } from '@/lib/auth/session';
import { listAutomationRules } from '@/server/reports/reports.service';

export default async function AutomationPage() {
  const session = await requireRole('STAFF');
  const rules = await listAutomationRules(session.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="اتوماسیون"
        description={`${rules.length} قانون تعریف‌شده`}
        actions={
          <>
            <HelpLink section="automation" />
            <AutomationRunButton />
          </>
        }
      />

      <AutomationCreateForm />

      {rules.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="قانون اتوماسیونی تعریف نشده"
          description="با تعریف قوانین، کارهای تکراری به‌صورت خودکار انجام می‌شوند."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-right font-medium">نام</th>
                    <th className="p-3 text-right font-medium">ماشه</th>
                    <th className="p-3 text-right font-medium">اقدام</th>
                    <th className="p-3 text-right font-medium">وضعیت</th>
                    <th className="p-3 text-right font-medium">تاریخ ایجاد</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium">{rule.name}</div>
                        {rule.description ? (
                          <div className="text-xs text-muted-foreground">{rule.description}</div>
                        ) : null}
                      </td>
                      <td className="p-3">
                        {AUTOMATION_TRIGGER_LABELS[rule.trigger] ?? rule.trigger}
                      </td>
                      <td className="p-3">
                        {AUTOMATION_ACTION_LABELS[rule.action] ?? rule.action}
                      </td>
                      <td className="p-3">
                        <AutomationToggle ruleId={rule.id} isActive={rule.isActive} />
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <JalaliDate date={rule.createdAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
