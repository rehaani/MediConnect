
import ModerationDashboard from "@/components/dashboard/admin/moderation-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminModerationPage() {
  const user = await getCurrentUser('admin');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">Content Moderation</h1>
      <p className="text-muted-foreground mb-6">Review, approve, or reject user-generated content.</p>
      <ModerationDashboard />
    </div>
  );
}
