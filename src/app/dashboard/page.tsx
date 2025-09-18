
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { UserRole } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

// This component acts as a router to the correct dashboard.
export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole | null;

  useEffect(() => {
    const rolePaths = {
      patient: '/patient-dashboard',
      provider: '/provider-dashboard',
      admin: '/admin-dashboard',
    };
    
    const path = role ? rolePaths[role] : '/patient-dashboard'; // Default to patient
    router.replace(path);

  }, [role, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-4">Redirecting to your dashboard...</p>
    </div>
  );
}
