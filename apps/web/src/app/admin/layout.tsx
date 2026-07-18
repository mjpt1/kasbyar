import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/admin-shell';
import { requirePlatformAdmin } from '@/lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePlatformAdmin();
  if (!session) redirect('/login');

  return <AdminShell email={session.user.email}>{children}</AdminShell>;
}
