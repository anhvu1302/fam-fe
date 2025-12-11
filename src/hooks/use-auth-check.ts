/**
 * Hook to check and refresh auth state
 * Only calls /auth/me when refreshUserData is true
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";

interface UseAuthCheckOptions {
    onAuthSuccess?: () => void;
    onAuthFailed?: () => void;
    refreshUserData?: boolean; // Whether to call /auth/me
}

export function useAuthCheck(options: UseAuthCheckOptions = {}) {
    const router = useRouter();
    const { onAuthSuccess, onAuthFailed, refreshUserData = false } = options;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authenticated = tokenStorage.isAuthenticated();

                if (!authenticated) {
                    tokenStorage.clear();
                    onAuthFailed?.();
                    router.replace("/login");
                    return;
                }

                // Only call /auth/me if refreshUserData is true
                if (refreshUserData) {
                    await authApi.getCurrentUser();
                    tokenStorage.updateAuthState();
                }

                onAuthSuccess?.();
            } catch (error) {
                console.error("Auth check failed:", error);
                tokenStorage.clear();
                onAuthFailed?.();
                router.replace("/login");
            }
        };

        checkAuth();
    }, [router, onAuthSuccess, onAuthFailed, refreshUserData]);
}
