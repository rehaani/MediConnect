import FamilyManagement from "@/components/family/family-management";

export default function FamilyPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Family Member Management</h1>
          <p className="text-muted-foreground">
            Manage family members who can access your health information.
          </p>
        </div>
        <FamilyManagement />
      </div>
    </div>
  );
}
