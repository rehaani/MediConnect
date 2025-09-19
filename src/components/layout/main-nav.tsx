
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MenuContext } from "@/context/menu-provider"
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Logo from "./logo"
import { getCurrentUser, UserRole } from "@/lib/auth"
import { Skeleton } from "../ui/skeleton"

interface MainNavProps {
  items: {
    title: string
    href: string
  }[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()
  const router = useRouter();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = React.useContext(MenuContext);
  const { t } = useTranslation();
  const [dashboardUrl, setDashboardUrl] = React.useState<string>("/");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function determineDashboardUrl() {
        try {
            // In a real app, you might already have user context. Here we fetch it.
            const user = await getCurrentUser();
            const rolePaths: Record<UserRole, string> = {
                patient: '/patient-dashboard',
                provider: '/provider-dashboard',
                admin: '/admin-dashboard',
            };
            setDashboardUrl(rolePaths[user.role] || '/');
        } catch(e) {
            // Not logged in, default to home
            setDashboardUrl('/');
        } finally {
            setLoading(false);
        }
    }
    determineDashboardUrl();
  }, []);


  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    router.push(dashboardUrl);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === item.href
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {t(item.title)}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 pt-10">
             {loading ? <Skeleton className="h-7 w-36" /> : (
                <Link href={dashboardUrl} className="flex items-center" onClick={handleLogoClick}>
                    <Logo />
                </Link>
             )}
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-4">
                {items?.map(
                  (item) =>
                    item.href && (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-lg font-medium text-muted-foreground transition-colors hover:text-foreground",
                          pathname === item.href && "text-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t(item.title)}
                      </Link>
                    )
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
