
"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LanguageToggle } from "./language-toggle";
import type { User } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { Skeleton } from "../ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

export default function FloatingButtons() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
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
    }, []);

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
