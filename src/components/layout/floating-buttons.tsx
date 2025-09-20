
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LanguageToggle } from "./language-toggle";
import type { User, UserRole } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { getAuth } from "firebase/auth";
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
                // We no longer need to infer the role from the path.
                // We can just get the current user, and the mock will default correctly.
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (e) {
                // User is not logged in, which is fine.
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [pathname]);
    
    const handleHomeClick = async () => {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;

        if (firebaseUser) {
            try {
                // Force-refresh the token to get the latest custom claims
                const tokenResult = await firebaseUser.getIdTokenResult(true);
                const role = tokenResult.claims.role || 'patient'; // Default to 'patient'

                const rolePaths: Record<UserRole, string> = {
                    patient: '/patient-dashboard',
                    provider: '/provider-dashboard',
                    admin: '/admin-dashboard',
                };
                
                router.push(rolePaths[role as UserRole] || '/');

            } catch (error) {
                console.error("Error refreshing token or navigating:", error);
                // Fallback to mock user data if token refresh fails in dev
                if (user) {
                    const rolePaths: Record<UserRole, string> = {
                        patient: '/patient-dashboard',
                        provider: '/provider-dashboard',
                        admin: '/admin-dashboard',
                    };
                    router.push(rolePaths[user.role] || '/');
                } else {
                    router.push('/login');
                }
            }
        } else {
             // Fallback for mock environment or if user is not found
            if (user) {
                const rolePaths: Record<UserRole, string> = {
                    patient: '/patient-dashboard',
                    provider: '/provider-dashboard',
                    admin: '/admin-dashboard',
                };
                router.push(rolePaths[user.role] || '/');
            } else {
                router.push('/login');
            }
        }
    };

    const authPages = ['/login', '/register', '/forgot-password', '/otp-verify', '/welcome', '/'];
    const showHomeButton = user && !pathname.includes('dashboard') && !authPages.includes(pathname);

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
