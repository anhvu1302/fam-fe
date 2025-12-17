"use client";

/**
 * Utility functions for app settings
 */

import { useAppSettingsByGroup } from "@/lib/hooks/use-app-settings";

/**
 * Hook to get branding settings
 */
export function useBrandingSettings() {
    return useAppSettingsByGroup("branding");
}

/**
 * Hook to get feature settings
 */
export function useFeatureSettings() {
    return useAppSettingsByGroup("features");
}

/**
 * Hook to get footer settings
 */
export function useFooterSettings() {
    return useAppSettingsByGroup("footer");
}

/**
 * Hook to get general app settings
 */
export function useGeneralSettings() {
    return useAppSettingsByGroup("general");
}
