/**
 * Hook to sync user data with backend on route changes
 * Calls /auth/me whenever the route changes to ensure data is up-to-date
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import authApi from "@/lib/api/auth";
import { useUser } from "@/lib/user-context";
import { UserInfo } from "@/types/auth";

export function useRouteAuthSync() {
    const pathname = usePathname();
    const lastPathRef = useRef<string | null>(null);
    const { setUser } = useUser();

    useEffect(() => {
        // Skip if this is the first mount (handled by useAuthCheck)
        if (lastPathRef.current === null) {
            lastPathRef.current = pathname;
            return;
        }

        // Skip if path hasn't changed
        if (lastPathRef.current === pathname) {
            return;
        }

        lastPathRef.current = pathname;

        // Skip auth routes
        if (pathname?.includes('/login') ||
            pathname?.includes('/forgot-password') ||
            pathname?.includes('/reset-password')) {
            return;
        }

        // Call /auth/me to sync user data with backend
        const syncUserData = async () => {
            try {
                const userData = await authApi.getCurrentUser() as UserInfo;
                setUser(userData);
            } catch (_error) {
                // Silently fail - error will be handled by auth guard
                // User will be redirected to login if session is invalid
            }
        };

        syncUserData();
    }, [pathname, setUser]);
}
