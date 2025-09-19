
"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { User } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import { Bot, Calendar, FileText, HeartPulse, Pill, User as UserIcon, Shield, Users } from "lucide-react";
import PatientDashboard from "@/components/dashboard/patient-dashboard";


const patientFeatures = [
    { 
      name: 'AI Health Assessor', 
      path: '/ai-health-assessor', 
      icon: <Bot />, 
      bgColor: '#3b82f6',
      description: 'Get a preliminary health check.'
    },
    { 
      name: 'Appointments', 
      path: '/appointments', 
      icon: <Calendar />, 
      bgColor: '#10b981',
      description: 'Schedule new appointments.'
    },
    { 
      name: 'Symptom Tracker', 
      path: '/symptom-tracker', 
      icon: <HeartPulse />, 
      bgColor: '#f97316',
      description: 'Log your daily symptoms.'
    },
    { 
      name: 'Document Analyzer', 
      path: '/document-analyzer', 
      icon: <FileText />, 
      bgColor: '#8b5cf6',
      description: 'Analyze medical documents.'
    },
    { 
      name: 'Medications', 
      path: '/medications', 
      icon: <Pill />, 
      bgColor: '#ec4899',
      description: 'Manage your medications.'
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: <UserIcon />, 
      bgColor: '#6366f1',
      description: 'Update your user profile.'
    },
    {
      name: 'Family',
      path: '/family',
      icon: <Users />,
      bgColor: '#14b8a6',
      description: 'Manage family members.'
    },
     {
      name: 'Video Consultation',
      path: '/video-consultation',
      icon: <Shield />,
      bgColor: '#d946ef',
      description: 'Start a video call.'
    }
];


export default function PatientDashboardPage() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getCurrentUser('patient');
      setUser(userData);
      // Set initial language based on user preference from "database"
      if (userData.language && i18n.language !== userData.language) {
        i18n.changeLanguage(userData.language);
      }
      setLoading(false);
    }
    fetchUser();
  }, [i18n]);


  if (loading || !user) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[140px]" />)}
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-headline mb-2">{t('Dashboard')}</h1>
        <p className="text-muted-foreground mb-6">{t("Welcome back, {{name}}. Here's your personalized view.", { name: user.name })}</p>
      </div>
      <DashboardCards features={patientFeatures} />
      <PatientDashboard user={user} />
    </div>
  );
}
