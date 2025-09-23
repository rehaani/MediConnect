
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { MenuProvider } from '@/context/menu-provider';
import I18nProvider from '@/context/i18n-provider';
import FloatingButtons from '@/components/layout/floating-buttons';
import { Montserrat, Roboto_Slab, Nunito } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});


function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <FloatingButtons />
      <main className="flex-1">{children}</main>
    </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MediConnect Auth</title>
        <meta name="description" content="Secure Authentication for Modern Healthcare" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin=""></script>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          montserrat.variable,
          robotoSlab.variable,
          nunito.variable
        )}
      >
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <MenuProvider>
              <RootLayoutContent>{children}</RootLayoutContent>
              <Toaster />
            </MenuProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
