
"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { User } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import PatientDashboard from "@/components/dashboard/patient-dashboard";
import { FEATURES } from "@/lib/dashboard-features.tsx";


export default function PatientDashboardPage() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const patientFeatures = FEATURES.filter(feature => feature.roles.includes('patient'));

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
