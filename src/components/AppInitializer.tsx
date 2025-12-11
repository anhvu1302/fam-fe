"use client";

import { useInitializeApp } from "@/hooks/use-initialize-app";

interface AppInitializerProps {
    children: React.ReactNode;
}

/**
 * App Initializer Component
 * Initializes app-level setup (device ID, etc.)
 */
export default function AppInitializer({ children }: AppInitializerProps) {
    useInitializeApp();
    return <>{children}</>;
}
