"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import settingsApi, { type AppSettingsGrouped } from "@/lib/api/settings";

interface SettingsContextType {
    settings: AppSettingsGrouped | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettingsGrouped | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await settingsApi.getAllSettings();
            setSettings(data);
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            console.error("Error fetching settings:", errorObj);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, error, refetch: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettingsContext must be used within SettingsProvider");
    }
    return context;
}
