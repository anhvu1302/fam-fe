/**
 * Hook to check and refresh auth state
 * Only calls /auth/me when refreshUserData is true
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";
import { UserInfo } from "@/types/auth";

interface UseAuthCheckOptions {
    onAuthSuccess?: () => void;
    onAuthFailed?: () => void;
    refreshUserData?: boolean; // Whether to call /auth/me
    setUser?: (user: UserInfo | null) => void; // To save user data
}

export function useAuthCheck(options: UseAuthCheckOptions = {}) {
    const router = useRouter();
    const { onAuthSuccess, onAuthFailed, refreshUserData = false, setUser } = options;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authenticated = tokenStorage.isAuthenticated();

                if (!authenticated) {
                    tokenStorage.clear();
                    setUser?.(null);
                    onAuthFailed?.();
                    router.replace("/login");
                    return;
                }

                // Only call /auth/me if refreshUserData is true
                if (refreshUserData) {
                    const userData = await authApi.getCurrentUser() as UserInfo;
                    tokenStorage.updateAuthState();
                    setUser?.(userData);
                }

                onAuthSuccess?.();
            } catch (error) {
                console.error("Auth check failed:", error);
                tokenStorage.clear();
                setUser?.(null);
                onAuthFailed?.();
                router.replace("/login");
            }
        };

        checkAuth();
    }, [router, onAuthSuccess, onAuthFailed, refreshUserData, setUser]);
}
