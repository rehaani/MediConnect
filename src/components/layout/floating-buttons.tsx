
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LanguageToggle } from "./language-toggle";
import type { User, UserRole } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { Skeleton } from "../ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { Home } from "lucide-react";

export default function FloatingButtons() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            try {
                // Fetch user on mount to determine button visibility
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (e) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [pathname]);
    
    const handleHomeClick = async () => {
        try {
            // Always fetch the current user on click to get the correct role
            const currentUser = await getCurrentUser();
            const role = currentUser.role || 'patient'; 

            const rolePaths: Record<UserRole, string> = {
                patient: '/patient-dashboard',
                provider: '/provider-dashboard',
                admin: '/admin-dashboard',
            };
            
            router.push(rolePaths[role]);

        } catch (error) {
            console.error("Error navigating to dashboard:", error);
            // Fallback for any unexpected errors (e.g., user signed out)
            router.push('/login');
        }
    };

    const authPages = ['/login', '/register', '/forgot-password', '/otp-verify', '/welcome', '/'];
    const dashboardPages = ['/patient-dashboard', '/provider-dashboard', '/admin-dashboard'];
    
    // Hide the button on auth pages, dashboard pages, or if the user is not logged in.
    const showHomeButton = user && !authPages.includes(pathname) && !dashboardPages.includes(pathname);


    return (
        <>
            {/* Top Right Container */}
            <motion.div 
                className="fixed top-4 right-4 z-50 flex items-center gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <ThemeToggle />
                <AnimatePresence>
                    {loading ? (
                         <Skeleton className="h-9 w-9 rounded-full" />
                    ) : user ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <UserMenu user={user} />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </motion.div>

            {/* Bottom Left Container */}
            <AnimatePresence>
            {showHomeButton && (
                 <motion.div 
                    className="fixed bottom-4 left-4 z-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button
                        isIconOnly
                        size="icon"
                        aria-label="Return to Dashboard"
                        onClick={handleHomeClick}
                    >
                        <Home />
                    </Button>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Bottom Right Container */}
            <motion.div 
                className="fixed bottom-4 right-4 z-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <LanguageToggle />
            </motion.div>
        </>
    );
}
