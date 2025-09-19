
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { getCurrentUser, UserRole, User } from '@/lib/auth';
import { MainNav } from './main-nav';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';
import { UserMenu } from './user-menu';

const patientNavItems = [
    { title: 'Dashboard', href: '/patient-dashboard' },
    { title: 'AI Health Assessor', href: '/ai-health-assessor' },
    { title: 'Appointments', href: '/appointments' },
    { title: 'Symptom Tracker', href: '/symptom-tracker' },
    { title: 'Document Analyzer', href: '/document-analyzer' },
    { title: 'Medications', href: '/medications' },
    { title: 'Profile', href: '/profile' },
    { title: 'Family', href: '/family' },
    { title: 'Video Consultation', href: '/video-consultation'},
];

const providerNavItems = [
    { title: 'Dashboard', href: '/provider-dashboard' },
    { title: 'Appointments', href: '/appointments' },
    { title: 'Document Analyzer', href: '/document-analyzer' },
    { title: 'Patients', href: '#' },
    { title: 'Schedule', href: '#' },
];

const adminNavItems = [
    { title: 'Dashboard', href: '/admin-dashboard' },
    { title: 'Users', href: '/admin-dashboard/users' },
    { title: 'Analytics', href: '/admin-dashboard/analytics' },
    { title: 'Moderation', href: '/admin-dashboard/moderation' },
    { title: 'Settings', href: '/admin-dashboard/settings' },
    { title: 'Test Suite', href: '/admin-dashboard/test-suite' },
];

const navItems: Record<UserRole, { title: string; href: string }[]> = {
    patient: patientNavItems,
    provider: providerNavItems,
    admin: adminNavItems,
};


export default function Header({ user }: { user: User }) {
  const roleNavItems = navItems[user.role] || [];
  const dashboardPath = `/dashboard?role=${user.role}`;
  const showLanguageToggle = user.role !== 'admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={dashboardPath} className="flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="md:hidden">
                <MainNav items={roleNavItems} />
            </div>
            <div className="w-full flex-1 md:w-auto md:flex-none">
                 {/* This could be a search bar in the future */}
            </div>
            <nav className="hidden md:flex gap-4 items-center">
                <MainNav items={roleNavItems} />
                {showLanguageToggle && <LanguageToggle />}
                <ThemeToggle />
                <UserMenu user={user} />
            </nav>
            <div className="flex items-center gap-2 md:hidden">
                {showLanguageToggle && <LanguageToggle />}
                <ThemeToggle />
                <UserMenu user={user} />
            </div>
        </div>
      </div>
    </header>
  );
}
