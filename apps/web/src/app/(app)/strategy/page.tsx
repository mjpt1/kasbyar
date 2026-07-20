import { StrategyWorkspace } from '@/components/strategy/strategy-workspace';
import { requireRole } from '@/lib/auth/session';

export default async function StrategyPage() {
  await requireRole('STAFF');
  return <StrategyWorkspace />;
}
