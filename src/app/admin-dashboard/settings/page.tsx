
import SettingsDashboard from "@/components/dashboard/admin/settings-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser('admin');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">Platform Settings</h1>
      <p className="text-muted-foreground mb-6">Manage global platform content and configurations.</p>
      <SettingsDashboard />
    </div>
  );
}
