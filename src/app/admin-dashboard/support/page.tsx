
import SupportDashboard from "@/components/dashboard/admin/support-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminSupportPage() {
  const user = await getCurrentUser('admin');

  return (
    <div className="container mx-auto p-4 md:p-8">
        <SupportDashboard />
    </div>
  );
}
