
import type { User } from "@/lib/auth";
import { Users, ShieldCheck, Server, Database, Activity, FlaskConical, BarChart, FileText, UserCog, Wrench } from "lucide-react";
import DashboardCards from "./dashboard-cards";


const AdminDashboard = ({ user }: { user: User }) => {
  
  const adminFeatures = [
    { 
      name: 'User Management', 
      path: '/admin-dashboard/users', 
      icon: <UserCog />, 
      bgColor: 'bg-blue-500',
      description: 'Manage user roles and permissions.'
    },
    { 
      name: 'Platform Analytics', 
      path: '/admin-dashboard/analytics', 
      icon: <BarChart />, 
      bgColor: 'bg-green-500',
      description: 'View usage statistics and metrics.'
    },
    { 
      name: 'Content Moderation', 
      path: '/admin-dashboard/moderation', 
      icon: <FileText />, 
      bgColor: 'bg-yellow-500',
      description: 'Review and moderate user content.'
    },
    { 
      name: 'Platform Settings', 
      path: '/admin-dashboard/settings', 
      icon: <Wrench />, 
      bgColor: 'bg-purple-500',
      description: 'Configure global app settings.'
    },
    { 
      name: 'Test Suite', 
      path: '/admin-dashboard/test-suite', 
      icon: <FlaskConical />, 
      bgColor: 'bg-red-500',
      description: 'Run automated system checks.'
    },
  ];

  return (
     <div className="space-y-6">
      <DashboardCards features={adminFeatures} />
      
      {/* System Health Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-headline">System Monitoring</CardTitle>
              <CardDescription>Real-time monitoring of platform services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">API Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-primary">99.9% Uptime</span>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Database</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <span className="text-sm text-primary">Operational</span>
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                </div>
                 <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Security Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">None</span>
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  </div>
                </div>
            </CardContent>
          </Card>
           <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,807</div>
              <p className="text-xs text-muted-foreground">+22% from last month</p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

// Re-add Card components to be used within the dashboard
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default AdminDashboard;
