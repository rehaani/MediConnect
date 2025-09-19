
import AnalyticsDashboard from "@/components/dashboard/admin/analytics-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser('admin');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">Platform Analytics</h1>
      <p className="text-muted-foreground mb-6">Explore user activity, platform health, and key metrics.</p>
      <AnalyticsDashboard />
    </div>
  );
}
