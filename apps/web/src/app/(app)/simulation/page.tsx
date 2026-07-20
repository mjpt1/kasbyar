import { SimulationWorkspace } from '@/components/simulation/simulation-workspace';
import { requireRole } from '@/lib/auth/session';

export default async function SimulationPage() {
  await requireRole('STAFF');
  return <SimulationWorkspace />;
}
