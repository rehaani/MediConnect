
import ProviderDashboard from "@/components/dashboard/provider-dashboard";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import { getCurrentUser } from "@/lib/auth";
import { FEATURES } from "@/lib/dashboard-features.ts";

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser('provider');
  const providerFeatures = FEATURES.filter(feature => feature.roles.includes('provider'));

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-headline mb-2">Provider Dashboard</h1>
        <p className="text-muted-foreground mb-6">Welcome back, {user.name}. Here's an overview of your day.</p>
      </div>
      <DashboardCards features={providerFeatures} />
      <ProviderDashboard user={user} />
    </div>
  );
}
