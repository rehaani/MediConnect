
import PatientDashboard from "@/components/dashboard/patient-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function PatientDashboardPage() {
  const user = await getCurrentUser('patient');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome back, {user.name}. Here&apos;s your personalized view.</p>
      <PatientDashboard user={user} />
    </div>
  );
}
