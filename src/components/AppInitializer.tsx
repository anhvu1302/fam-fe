"use client";

import { useAuthStateSync } from "@/lib/hooks/use-auth-state-sync";
import { useInitializeApp } from "@/lib/hooks/use-initialize-app";

interface AppInitializerProps {
    children: React.ReactNode;
}

/**
 * App Initializer Component
 * Initializes app-level setup (device ID, cross-tab auth sync, etc.)
 */
export default function AppInitializer({ children }: AppInitializerProps) {
    useInitializeApp();
    useAuthStateSync(); // Sync auth state across tabs
    return <>{children}</>;
}
