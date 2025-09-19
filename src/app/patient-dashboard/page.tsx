
"use client";

import PatientDashboard from "@/components/dashboard/patient-dashboard";
import { getCurrentUser } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { User } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getCurrentUser('patient');
      setUser(userData);
      setLoading(false);
    }
    fetchUser();
  }, []);


  if (loading || !user) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[400px] lg:col-span-2" />
                <div className="space-y-6">
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[150px]" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-headline mb-2">{t('Dashboard')}</h1>
      <p className="text-muted-foreground mb-6">{t("Welcome back, {{name}}. Here's your personalized view.", { name: user.name })}</p>
      <PatientDashboard user={user} />
    </div>
  );
}
