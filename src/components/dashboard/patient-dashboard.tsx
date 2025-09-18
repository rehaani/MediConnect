import type { User } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, HeartPulse } from "lucide-react";

const PatientDashboard = ({ user }: { user: User }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Appointments
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            +2 since last week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Medical Records
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            Last updated 2 days ago
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Vitals Overview
          </CardTitle>
          <HeartPulse className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           <div className="text-2xl font-bold">Stable</div>
          <p className="text-xs text-muted-foreground">
            All vitals within normal range
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;
