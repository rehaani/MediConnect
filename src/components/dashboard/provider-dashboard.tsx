import type { User } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Bell } from "lucide-react";

const ProviderDashboard = ({ user }: { user: User }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Patients
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">124</div>
          <p className="text-xs text-muted-foreground">
            +10 from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Schedule
          </CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8 / 12</div>
          <p className="text-xs text-muted-foreground">
            Appointments completed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Alerts
          </CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderDashboard;
