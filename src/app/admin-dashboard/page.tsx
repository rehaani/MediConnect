
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser('admin');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome back, {user.name}. Here&apos;s the platform overview.</p>
      <AdminDashboard user={user} />
    </div>
  );
}
