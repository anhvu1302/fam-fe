/**
 * Hook to initialize device ID on app startup
 */
import { useEffect } from "react";

import { getOrCreateDeviceId } from "@/lib/device-id";

export function useInitializeApp() {
    useEffect(() => {
        // Initialize device ID on app startup
        // This ensures device ID is created before any API calls
        getOrCreateDeviceId();
    }, []);
}
