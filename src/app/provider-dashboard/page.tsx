
import ProviderDashboard from "@/components/dashboard/provider-dashboard";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import { getCurrentUser } from "@/lib/auth";
import { Calendar, FileText, Users, MonitorPlay } from "lucide-react";

const providerFeatures = [
    { 
      name: 'Patient Queue', 
      path: '/provider-dashboard', 
      icon: <Users />, 
      bgColor: '#3b82f6',
      description: "View today's patient list."
    },
    { 
      name: 'Appointments', 
      path: '/appointments', 
      icon: <Calendar />, 
      bgColor: '#10b981',
      description: 'Manage your schedule.'
    },
    { 
      name: 'Document Analyzer', 
      path: '/document-analyzer', 
      icon: <FileText />, 
      bgColor: '#8b5cf6',
      description: 'Analyze patient documents.'
    },
    { 
      name: 'Start Consultation', 
      path: '/video-consultation', 
      icon: <MonitorPlay />, 
      bgColor: '#f97316',
      description: 'Launch a video call room.'
    },
];

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser('provider');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-headline mb-2">Provider Dashboard</h1>
        <p className="text-muted-foreground mb-6">Welcome back, {user.name}. Here's an overview of your day.</p>
      </div>
      <DashboardCards features={providerFeatures} />
      <ProviderDashboard user={user} />
    </div>
  );
}
