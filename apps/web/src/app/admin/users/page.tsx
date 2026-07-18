import { AdminUsersPanel } from '@/components/admin/admin-users-panel';
import { listAllOrganizations, listAllUsers } from '@/server/admin/admin.service';

export default async function AdminUsersPage() {
  const [users, organizations] = await Promise.all([
    listAllUsers(),
    listAllOrganizations(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">کاربران و نقش‌ها</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          نقش سازمانی تعیین می‌کند کاربر چه منو و پیشخوانی ببیند. بسته صنعتی سازمان
          تعیین می‌کند کلینیک، خرده‌فروشی یا عمومی باشد.
        </p>
      </div>
      <AdminUsersPanel
        initialUsers={users}
        organizations={organizations.map((o) => ({
          id: o.id,
          name: o.name,
          industryPack: o.industryPack,
        }))}
      />
    </div>
  );
}
