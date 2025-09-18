
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

const patientNavItems = [
    { title: 'Dashboard', href: '/patient-dashboard' },
    { title: 'Appointments', href: '/appointments' },
    { title: 'AI Symptom Checker', href: '/ai-health-assessor' },
    { title: 'Symptom Tracker', href: '/symptom-tracker' },
    { title: 'Medications', href: '/medications' },
    { title: 'Profile', href: '/profile' },
    { title: 'Family', href: '/family' },
    { title: 'Video Consultation', href: '/video-consultation'},
];

const providerNavItems = [
    { title: 'Dashboard', href: '/provider-dashboard' },
    { title: 'Appointments', href: '/appointments' },
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
        <div className="mr-auto flex items-center md:hidden">
          <Link href={dashboardPath} className="flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="md:hidden">
           <UserMenu />
        </div>
      </div>
      <div className="container flex h-16 items-center">
        <Link href={dashboardPath} className="mr-6 hidden items-center space-x-2 md:flex">
          <Logo />
        </Link>
        <MainNav items={roleNavItems} />
        <div className="hidden flex-1 items-center justify-end space-x-4 md:flex">
           <ThemeToggle />
           <UserMenu />
        </div>
      </div>
    </header>
  );
}
