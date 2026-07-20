import { MeetingsWorkspace } from '@/components/meetings/meetings-workspace';
import { requireSession } from '@/lib/auth/session';

export default async function MeetingsPage() {
  await requireSession();
  return <MeetingsWorkspace />;
}
