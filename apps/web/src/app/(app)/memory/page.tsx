import { MemoryWorkspace } from '@/components/memory/memory-workspace';
import { requireSession } from '@/lib/auth/session';

export default async function MemoryPage() {
  await requireSession();
  return <MemoryWorkspace />;
}
