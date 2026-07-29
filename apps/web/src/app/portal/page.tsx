import { redirect } from 'next/navigation';

import { CustomerPortalView } from '@/components/features/portal/customer-portal-view';
import { getCustomerPortalFromSession } from '@/server/portal/customer-portal.service';

export default async function CustomerPortalSessionPage() {
  const portal = await getCustomerPortalFromSession();
  if (!portal) {
    redirect('/portal/login');
  }

  return <CustomerPortalView portal={portal} showLogout />;
}
