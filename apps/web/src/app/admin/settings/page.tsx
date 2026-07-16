import { AdminPlatformSettingsForm } from '@/components/admin/admin-platform-settings-form';
import { getOrCreatePlatformSettings } from '@/server/admin/admin.service';

export default async function AdminSettingsPage() {
  const settings = await getOrCreatePlatformSettings();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">تنظیمات پلتفرم</h2>
        <p className="text-sm text-muted-foreground">
          کنترل ثبت‌نام عمومی و نقش اولیه کاربران جدید.
        </p>
      </div>
      <AdminPlatformSettingsForm initial={settings} />
    </div>
  );
}
