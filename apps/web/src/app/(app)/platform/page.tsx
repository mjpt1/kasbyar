import { PlatformWorkspace } from '@/components/platform/platform-workspace';
import { requireRole } from '@/lib/auth/session';

export default async function PlatformPage() {
  await requireRole('STAFF');
  return <PlatformWorkspace />;
}
