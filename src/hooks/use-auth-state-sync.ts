/**
 * Hook to sync authentication state across browser tabs
 * Listens to localStorage changes and syncs auth state
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthStateSync() {
    const router = useRouter();

    useEffect(() => {
        // Listen for localStorage changes from other tabs AND same tab
        const handleStorageChange = (e: StorageEvent) => {
            // Auth state changed in another tab
            if (e.key === "_has_session") {
                if (e.newValue === "true" && e.oldValue !== "true") {
                    // User logged in on another tab - refresh current tab
                    console.log("[Auth Sync] User logged in, reloading...");
                    window.location.reload();
                } else if ((e.newValue === null || e.newValue === "false") && e.oldValue === "true") {
                    // User logged out on another tab - just redirect without calling logout API again
                    console.log("[Auth Sync] User logged out, redirecting to login...");
                    router.push("/login");
                }
            }

            // Auth timestamp changed (token refresh happened)
            if (e.key === "_auth_timestamp" && e.newValue) {
                // Token was refreshed in another tab
                console.log("[Auth Sync] Tokens refreshed in another tab");
                // No action needed - cookies are shared
            }
        };

        // Add event listener for cross-tab communication
        window.addEventListener("storage", handleStorageChange);

        // Cleanup
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [router]);
}
