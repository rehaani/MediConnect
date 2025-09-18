import ProfileForm from "@/components/profile/profile-form";
import ProfileProgress from "@/components/profile/profile-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Complete your profile to get the most out of MediConnect.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileProgress />
          </CardContent>
        </Card>
        <ProfileForm />
      </div>
    </div>
  );
}
