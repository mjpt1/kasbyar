import { ForecastWorkspace } from '@/components/forecast/forecast-workspace';
import { requireRole } from '@/lib/auth/session';

export default async function ForecastPage() {
  await requireRole('STAFF');
  return <ForecastWorkspace />;
}
