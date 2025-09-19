
import UserManagement from "@/components/dashboard/admin/user-management";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminUsersPage() {
  const user = await getCurrentUser('admin');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">User Management</h1>
      <p className="text-muted-foreground mb-6">View, manage, and assign roles to users.</p>
      <UserManagement />
    </div>
  );
}
