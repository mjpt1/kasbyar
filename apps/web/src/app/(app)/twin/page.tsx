import { TwinWorkspace } from '@/components/twin/twin-workspace';
import { requireSession } from '@/lib/auth/session';

export default async function TwinPage() {
  await requireSession();
  return <TwinWorkspace />;
}
