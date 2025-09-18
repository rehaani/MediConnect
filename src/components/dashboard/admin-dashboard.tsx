import type { User } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, BarChart } from "lucide-react";

const AdminDashboard = ({ user }: { user: User }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,482</div>
          <p className="text-xs text-muted-foreground">
            +50 new users this week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            System Status
          </CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">Operational</div>
          <p className="text-xs text-muted-foreground">
            All systems are running smoothly
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Access Logs
          </CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           <div className="text-2xl font-bold">3,204</div>
          <p className="text-xs text-muted-foreground">
            Logins in the last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
