import { AdminOrganizationsPanel } from '@/components/admin/admin-organizations-panel';
import { listAllOrganizations } from '@/server/admin/admin.service';

export default async function AdminOrganizationsPage() {
  const organizations = await listAllOrganizations();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">سازمان‌ها و پیشخوان</h2>
        <p className="text-sm text-muted-foreground">
          بسته صنعتی هر سازمان تعیین می‌کند کاربران آن سازمان پیشخوان کلینیک،
          آژانس مسافرتی، خرده‌فروشی یا عمومی ببینند — مستقل از نقش فردی.
        </p>
      </div>
      <AdminOrganizationsPanel initialOrgs={organizations} />
    </div>
  );
}
