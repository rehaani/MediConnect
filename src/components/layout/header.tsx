
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LifeBuoy, LogOut, Settings, User } from 'lucide-react';
import Logo from './logo';
import { getCurrentUser, UserRole } from '@/lib/auth';
import { MainNav } from './main-nav';
import { ThemeToggle } from './theme-toggle';
import { LanguageToggle } from './language-toggle';

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
    { title: 'AI Health Assessor', href: '/ai-health-assessor' },
    { title: 'Appointments', href: '/appointments' },
    { title: 'Document Analyzer', href: '/document-analyzer' },
    { title: 'Patients', href: '#' },
    { title: 'Schedule', href: '#' },
];

const adminNavItems = [
    { title: 'Dashboard', href: '/admin-dashboard' },
    { title: 'Users', href: '#' },
    { title: 'Providers', href: '#' },
    { title: 'Analytics', href: '#' },
    { 'title': 'Settings', 'href': '#' },
];

const navItems: Record<UserRole, { title: string; href: string }[]> = {
    patient: patientNavItems,
    provider: providerNavItems,
    admin: adminNavItems,
};


export default async function Header() {
  const user = await getCurrentUser();
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const roleNavItems = navItems[user.role] || [];
  const dashboardPath = `/dashboard?role=${user.role}`;

  const UserMenu = () => (
     <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person portrait"/>
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  );

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
                <LanguageToggle />
                <ThemeToggle />
                <UserMenu />
            </nav>
            <div className="flex items-center gap-2 md:hidden">
                <LanguageToggle />
                <ThemeToggle />
                <UserMenu />
            </div>
        </div>
      </div>
    </header>
  );
}
