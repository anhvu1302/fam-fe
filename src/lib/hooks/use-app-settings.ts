"use client";

import { useMemo } from "react";

import type { AppSettingsMap } from "@/lib/api/settings";
import { useSettingsContext } from "@/lib/contexts/settings-context";

export interface UseAppSettingsByGroupReturn {
    settings: AppSettingsMap;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook to get settings by group (uses SettingsProvider context)
 * Only loads settings once when provider mounts
 */
export function useAppSettingsByGroup(
    group: string
): UseAppSettingsByGroupReturn {
    const { settings, loading, error } = useSettingsContext();

    const groupSettings = useMemo(() => {
        if (!settings || !settings[group]) {
            return {};
        }
        return settings[group];
    }, [settings, group]);

    return {
        settings: groupSettings,
        loading,
        error,
    };
}
