import type { MembershipRole } from '@prisma/client';

import { InboxThreadList } from '@/components/features/inbox/inbox-thread-list';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/permissions';
import { getOrgIntegrationsPublicView } from '@/server/integrations/org-credentials.service';

function ChannelStatus({
  label,
  configured,
  webhookUrl,
}: {
  label: string;
  configured: boolean;
  webhookUrl: string;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{label}</span>
        <Badge variant={configured ? 'success' : 'warning'}>
          {configured ? 'فعال' : 'نیاز به تنظیم'}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {configured
          ? 'پیام‌های دریافتی از webhook اینجا نمایش داده می‌شوند.'
          : 'برای فعال‌سازی، کلیدها را در تنظیمات > یکپارچه‌سازی وارد کنید.'}
      </p>
      <div dir="ltr" className="rounded-md bg-muted px-3 py-2 text-left text-xs font-mono break-all">
        {webhookUrl}
      </div>
    </div>
  );
}

export default async function InboxPage() {
  const session = await requireSession();
  const integrations = await getOrgIntegrationsPublicView(session.organizationId);
  const canAssign = hasMinRole(session.role as MembershipRole, 'MANAGER');

  return (
    <div className="space-y-6">
      <PageHeader
        title="صندوق پیام"
        description="مکالمات واتساپ، پیامک، ایمیل، تلگرام و تماس با مشتریان — یکپارچه با CRM"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">وضعیت کانال‌ها</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ChannelStatus
            label="واتساپ"
            configured={integrations.whatsapp.configured}
            webhookUrl={integrations.whatsapp.webhookUrl}
          />
          <ChannelStatus
            label="پیامک (کاوه‌نگار)"
            configured={integrations.sms.configured}
            webhookUrl={integrations.sms.webhookUrl}
          />
          <ChannelStatus
            label="ایمیل (Resend)"
            configured={integrations.email.configured}
            webhookUrl={integrations.email.webhookUrl}
          />
          <ChannelStatus
            label="تماس VoIP"
            configured={integrations.voip.configured}
            webhookUrl={integrations.voip.webhookUrl}
          />
          <ChannelStatus
            label="تلگرام"
            configured={integrations.telegram.configured}
            webhookUrl={integrations.telegram.webhookUrl}
          />
          <ChannelStatus
            label="اینستاگرام DM"
            configured={integrations.instagram.configured}
            webhookUrl={integrations.instagram.webhookUrl}
          />
        </CardContent>
      </Card>

      <InboxThreadList canAssign={canAssign} />
    </div>
  );
}
