/**
 * Hook to check and refresh auth state
 * Only calls /auth/me when refreshUserData is true
 */
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import authApi, { type UserInfo } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/utils/token-storage";

interface UseAuthCheckOptions {
    onAuthSuccess?: () => void;
    onAuthFailed?: () => void;
    refreshUserData?: boolean; // Whether to call /auth/me
    setUser?: (user: UserInfo | null) => void; // To save user data
}

export function useAuthCheck(options: UseAuthCheckOptions = {}) {
    const router = useRouter();
    const { onAuthSuccess, onAuthFailed, refreshUserData = false, setUser } = options;
    const loadedRef = useRef(false);

    useEffect(() => {
        // Prevent double call in React Strict Mode
        if (loadedRef.current) return;
        loadedRef.current = true;

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
                    const response = await authApi.me();
                    if (!response.success) {
                        throw new Error(response.message || "Failed to get user data");
                    }
                    tokenStorage.updateAuthState();
                    setUser?.(response.result);
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
