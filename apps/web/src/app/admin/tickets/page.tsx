import { AdminTicketsPanel } from '@/components/admin/admin-tickets-panel';

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <AdminTicketsPanel initialTicketId={id ?? null} />;
}
