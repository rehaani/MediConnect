
import ProviderDashboard from "@/components/dashboard/provider-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser('provider');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">Provider Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome back, {user.name}. Here are your patients for today.</p>
      <ProviderDashboard user={user} />
    </div>
  );
}
