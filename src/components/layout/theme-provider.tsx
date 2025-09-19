
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
import { getCurrentUser } from "@/lib/auth"

function ThemeLoader({ children }: { children: React.ReactNode }) {
    const { setTheme } = useTheme();

    React.useEffect(() => {
        const fetchAndSetTheme = async () => {
            try {
                const user = await getCurrentUser();
                if (user && user.theme) {
                    setTheme(user.theme);
                }
            } catch (error) {
                // User is not logged in, `next-themes` will use localStorage or system preference.
                console.log("No logged-in user found for theme loading.");
            }
        };

        fetchAndSetTheme();
    }, [setTheme]);

    return <>{children}</>;
}


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
        <ThemeLoader>{children}</ThemeLoader>
    </NextThemesProvider>
  )
}
