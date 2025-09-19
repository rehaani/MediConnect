
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { ThemeToggle } from "./theme-toggle"

interface MainNavProps {
  items: {
    title: string
    href: string
  }[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = React.useContext(MenuContext);
  const { t } = useTranslation();

  return (
    <>
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
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {items?.map(
                  (item) =>
                    item.href && (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-muted-foreground transition-colors hover:text-foreground",
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
