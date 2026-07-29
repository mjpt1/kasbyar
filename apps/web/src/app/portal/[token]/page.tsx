import { redirect } from 'next/navigation';

import { getCustomerPortalByToken } from '@/server/portal/customer-portal.service';

/** Legacy token URLs claim an httpOnly session cookie then land on /portal */
export default async function CustomerPortalTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const portal = await getCustomerPortalByToken(token);
  if (!portal) {
    redirect('/portal/login?error=expired');
  }
  redirect(`/api/portal/claim/${encodeURIComponent(token)}`);
}
