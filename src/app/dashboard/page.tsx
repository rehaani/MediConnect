import AdminDashboard from "@/components/dashboard/admin-dashboard";
import PatientDashboard from "@/components/dashboard/patient-dashboard";
import ProviderDashboard from "@/components/dashboard/provider-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { role?: 'patient' | 'provider' | 'admin' };
}) {
  const role = searchParams?.role;
  const user = await getCurrentUser(role);

  const renderDashboard = () => {
    switch (user.role) {
      case "patient":
        return <PatientDashboard user={user} />;
      case "provider":
        return <ProviderDashboard user={user} />;
      case "admin":
        return <AdminDashboard user={user} />;
      default:
        return <p>Invalid user role.</p>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome back, {user.name}. Here&apos;s your personalized view.</p>
      {renderDashboard()}
    </div>
  );
}
