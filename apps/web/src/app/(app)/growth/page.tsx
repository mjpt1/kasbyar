import { GrowthWorkspace } from '@/components/growth/growth-workspace';
import { requireRole } from '@/lib/auth/session';

export default async function GrowthPage() {
  await requireRole('STAFF');
  return <GrowthWorkspace />;
}
