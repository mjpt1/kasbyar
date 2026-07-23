import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { ChatWorkspace } from '@/components/chat/chat-workspace';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getOrgModuleToggles } from '@/server/modules/org-module.service';
import { isOrgModuleEnabled } from '@kesbyar/shared';

export default async function ChatPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const toggles = await getOrgModuleToggles(session.organizationId);
  const chatEnabled = isOrgModuleEnabled(toggles, 'internal_chat');

  if (!chatEnabled) {
    return (
      <div className="space-y-4">
        <PageHeader title="گفتگوی تیم" description="پیام مستقیم و کانال‌های داخلی سازمان" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="size-10 text-muted-foreground" aria-hidden />
            <div className="space-y-2">
              <p className="font-medium">گفتگوی داخلی تیم برای سازمان شما غیرفعال است.</p>
              <p className="text-sm text-muted-foreground">
                از بخش افزونه‌ها در پلتفرم می‌توانید این قابلیت را فعال کنید.
              </p>
            </div>
            <Button asChild className="cursor-pointer">
              <Link href="/platform">رفتن به افزونه‌ها</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ChatWorkspace />;
}
