import { CommandCenterClient } from '@/components/command/command-center';
import { requireSession } from '@/lib/auth/session';

export default async function CommandPage() {
  await requireSession();
  return <CommandCenterClient />;
}
